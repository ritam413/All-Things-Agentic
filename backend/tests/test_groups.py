"""
TDD Test Suite for Multi-Group / Household and Member Management (Ticket T-17).
Covers group creation, group listing, member CRUD, habit profile auto-initialization,
group isolation, and dynamic expense splitting across members.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.firestore_service import storage
from backend.app.services.auth_service import auth_service
from shared.schema import (
    DEFAULT_HOUSEHOLD_ID,
    SplitRuleType,
    HabitBadge,
    ExpenseCategory,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_state():
    """Resets memory state and auth personas before each test."""
    storage._seed_initial_data()
    auth_service.reset_to_default_personas()


def test_create_household_standalone():
    """Test creating a standalone household via POST /api/households."""
    payload = {
        "name": "Indiranagar Penthouse",
        "default_currency": "INR",
        "default_split_rule": "ROOM_AREA",
    }
    response = client.post("/api/households", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"].startswith("hh_")
    assert data["name"] == "Indiranagar Penthouse"
    assert data["default_split_rule"] == "ROOM_AREA"
    assert len(data["roommates"]) == 0


def test_create_household_with_authenticated_user():
    """Test creating a household with an authenticated user token auto-adds creator as a roommate."""
    # Login as Alex Chen
    login_res = client.post("/api/auth/login", json={"email": "alex.chen@example.com", "password": "password123"})
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]

    payload = {
        "name": "Koramangala 5th Block Flat",
        "default_currency": "INR",
        "default_split_rule": "EQUAL",
    }
    response = client.post("/api/households", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    hh_id = data["id"]
    assert len(data["roommates"]) == 1
    assert data["roommates"][0]["id"] == user_id
    assert data["roommates"][0]["name"] == "Alex Chen"

    # Verify user's household_ids updated
    user = auth_service.get_user_by_id(user_id)
    assert hh_id in user.household_ids


def test_list_households_all_and_filtered():
    """Test listing all households vs filtering by user."""
    # Create two new households
    h1 = storage.create_household(name="Group Alpha", creator_user_id="rm_alex")
    h2 = storage.create_household(name="Group Beta", creator_user_id="rm_priya")

    # 1. List all
    res_all = client.get("/api/households")
    assert res_all.status_code == 200
    all_hh_ids = [hh["id"] for hh in res_all.json()]
    assert DEFAULT_HOUSEHOLD_ID in all_hh_ids
    assert h1.id in all_hh_ids
    assert h2.id in all_hh_ids

    # 2. Filter by user_id query param
    res_alex = client.get(f"/api/households?user_id=rm_alex")
    assert res_alex.status_code == 200
    alex_hh_ids = [hh["id"] for hh in res_alex.json()]
    assert h1.id in alex_hh_ids
    assert h2.id not in alex_hh_ids


def test_add_member_and_habit_profile_init():
    """Test adding a new member to a household and verifying HabitProfile auto-initialization."""
    hh = storage.create_household(name="Whitefield Villa")

    member_payload = {
        "name": "Rohan Gupta",
        "email": "rohan.gupta@example.com",
        "phone": "+919988776655",
        "upi_vpa": "rohan@icici",
        "room_sq_ft": 320.0,
        "custom_split_pct": 25.0,
    }

    res = client.post(f"/api/households/{hh.id}/members", json=member_payload)
    assert res.status_code == 201
    member_data = res.json()
    assert member_data["id"].startswith("rm_")
    assert member_data["name"] == "Rohan Gupta"
    assert member_data["room_sq_ft"] == 320.0
    assert member_data["upi_vpa"] == "rohan@icici"

    # Verify HabitProfile was automatically initialized in memory bank
    profile = storage.get_habit_profile(member_data["id"])
    assert profile is not None
    assert profile.roommate_id == member_data["id"]
    assert profile.roommate_name == "Rohan Gupta"
    assert profile.habit_badge == HabitBadge.RELIABLE
    assert profile.avg_settlement_hours == 24.0
    assert profile.on_time_ratio == 1.0
    assert profile.total_bills_settled == 0


def test_add_member_duplicate_rejection():
    """Test that adding a member with an existing email in the household is rejected with 400."""
    hh = storage.create_household(name="HSR Layout House")
    client.post(f"/api/households/{hh.id}/members", json={"name": "Vikram", "email": "vikram@example.com", "upi_vpa": "vikram@upi"})

    # Duplicate attempt
    res = client.post(f"/api/households/{hh.id}/members", json={"name": "Vikram Second", "email": "vikram@example.com", "upi_vpa": "vikram2@upi"})
    assert res.status_code == 400
    assert "already in this household" in res.json()["detail"]


def test_update_member_attributes():
    """Test updating room square footage, name, and UPI VPA of a member."""
    hh = storage.create_household(name="BTM Layout Hub")
    add_res = client.post(f"/api/households/{hh.id}/members", json={"name": "Ananya Roy", "email": "ananya@example.com", "upi_vpa": "ananya@upi", "room_sq_ft": 200.0})
    rm_id = add_res.json()["id"]

    patch_payload = {
        "name": "Ananya R.",
        "upi_vpa": "ananya@okaxis",
        "room_sq_ft": 280.0,
    }
    patch_res = client.patch(f"/api/households/{hh.id}/members/{rm_id}", json=patch_payload)
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["name"] == "Ananya R."
    assert updated_data["upi_vpa"] == "ananya@okaxis"
    assert updated_data["room_sq_ft"] == 280.0

    # Verify HabitProfile name updated
    profile = storage.get_habit_profile(rm_id)
    assert profile.roommate_name == "Ananya R."


def test_remove_household_member():
    """Test removing a member from a household via DELETE /api/households/{id}/members/{rm_id}."""
    hh = storage.create_household(name="Sarjapur Residency")
    add_res = client.post(f"/api/households/{hh.id}/members", json={"name": "Dev Test", "email": "dev@example.com", "upi_vpa": "dev@upi"})
    rm_id = add_res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/households/{hh.id}/members/{rm_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"

    # Confirm member is no longer in household
    hh_updated = storage.get_household(hh.id)
    assert not any(rm.id == rm_id for rm in hh_updated.roommates)


def test_group_isolation_and_dynamic_expense_splitting():
    """Test that two separate households maintain complete isolation and expenses split among active members."""
    # Group A with 2 members
    hh_a = storage.create_household(name="Apartment A")
    m1 = storage.add_member_to_household(hh_a.id, name="User A1", email="a1@test.com", upi_vpa="a1@upi")
    m2 = storage.add_member_to_household(hh_a.id, name="User A2", email="a2@test.com", upi_vpa="a2@upi")

    # Group B with 3 members
    hh_b = storage.create_household(name="Apartment B")
    m3 = storage.add_member_to_household(hh_b.id, name="User B1", email="b1@test.com", upi_vpa="b1@upi")
    m4 = storage.add_member_to_household(hh_b.id, name="User B2", email="b2@test.com", upi_vpa="b2@upi")
    m5 = storage.add_member_to_household(hh_b.id, name="User B3", email="b3@test.com", upi_vpa="b3@upi")

    # Ingest expense into Group A
    exp_a_payload = {
        "household_id": hh_a.id,
        "payer_id": m1.id,
        "vendor": "Groceries Group A",
        "category": ExpenseCategory.GROCERIES.value,
        "total_amount": 1000.0,
        "split_rule": SplitRuleType.EQUAL.value,
    }
    exp_a_res = client.post("/api/expenses", json=exp_a_payload)
    assert exp_a_res.status_code == 200
    exp_a = exp_a_res.json()
    assert len(exp_a["shares"]) == 2
    assert exp_a["shares"][0]["amount_owed"] == 500.0
    assert exp_a["shares"][1]["amount_owed"] == 500.0

    # Ingest expense into Group B
    exp_b_payload = {
        "household_id": hh_b.id,
        "payer_id": m3.id,
        "vendor": "Wifi Group B",
        "category": ExpenseCategory.WIFI.value,
        "total_amount": 900.0,
        "split_rule": SplitRuleType.EQUAL.value,
    }
    exp_b_res = client.post("/api/expenses", json=exp_b_payload)
    assert exp_b_res.status_code == 200
    exp_b = exp_b_res.json()
    assert len(exp_b["shares"]) == 3
    assert exp_b["shares"][0]["amount_owed"] == 300.0

    # Verify listing expenses respects household_id isolation
    list_a = client.get(f"/api/expenses?household_id={hh_a.id}").json()
    list_b = client.get(f"/api/expenses?household_id={hh_b.id}").json()
    assert len(list_a) == 1
    assert list_a[0]["vendor"] == "Groceries Group A"
    assert len(list_b) == 1
    assert list_b[0]["vendor"] == "Wifi Group B"


def test_household_not_found_errors():
    """Test 404 responses for non-existent households or members."""
    res_get = client.get("/api/households/hh_non_existent")
    assert res_get.status_code == 404

    res_add_member = client.post("/api/households/hh_non_existent/members", json={"name": "Ghost", "email": "ghost@test.com", "upi_vpa": "ghost@upi"})
    assert res_add_member.status_code == 404

    res_del_member = client.delete("/api/households/hh_non_existent/members/rm_ghost")
    assert res_del_member.status_code == 404
