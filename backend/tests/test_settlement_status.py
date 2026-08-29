"""
TDD Tests for Ticket T-18: Settlement Matrix & 'Who Has Paid vs Who Is Left' Engine.
Verifies aggregation math, paid vs pending segmentation, escalation urgency hierarchy,
and real-time updates upon payment & debt settlements.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.agent.core import agent
from backend.app.services.firestore_service import storage
from backend.app.services.auth_service import auth_service
from shared.schema import (
    DEFAULT_HOUSEHOLD_ID,
    DEFAULT_PAYER_ID,
    SplitRuleType,
    EscalationStage,
    SharePaymentStatus,
    HouseholdSettlementStatus,
)


@pytest.fixture(autouse=True)
def reset_state():
    """Resets memory storage to pristine seed state before every test."""
    storage._seed_initial_data()
    auth_service.reset_to_default_personas()


class TestSettlementStatusTDD:
    def test_clean_initial_household_settlement_status(self):
        """A new household with zero expenses has 0 billed, 100% cleared, and all members in paid_members."""
        new_hh = storage.create_household(name="Clean Test Apartment")
        
        status = agent.get_household_settlement_status(household_id=new_hh.id)
        assert isinstance(status, HouseholdSettlementStatus)
        assert status.household_id == new_hh.id
        assert status.total_billed == 0.0
        assert status.total_paid == 0.0
        assert status.total_pending == 0.0
        assert status.cleared_percentage == 100.0
        assert len(status.bills_summary) == 0
        assert len(status.pending_members) == 0
        # If created with 1 member (the creator)
        assert len(status.paid_members) == len(new_hh.roommates)
        for member in status.paid_members:
            assert member.is_cleared is True
            assert member.total_pending == 0.0
            assert member.pending_shares_count == 0
            assert member.highest_escalation_stage is None

    def test_single_expense_equal_split_aggregation(self):
        """Verifies exact sum conservation, segmentation of payer into paid_members and debtors into pending_members."""
        # Create an expense of 1000 for DEFAULT_HOUSEHOLD_ID (4 roommates: Alex, Priya, Rahul, Samira)
        exp = agent.create_and_split_expense(
            household_id=DEFAULT_HOUSEHOLD_ID,
            payer_id="rm_alex",
            vendor="Electricity Board",
            total_amount=1000.0,
            split_rule=SplitRuleType.EQUAL,
        )

        status = agent.get_household_settlement_status(household_id=DEFAULT_HOUSEHOLD_ID)
        assert status.total_billed == 1000.0
        assert status.total_paid == 250.0   # Alex paid his 250
        assert status.total_pending == 750.0 # 3 roommates * 250
        assert status.cleared_percentage == 25.0

        # Check paid_members (Alex)
        assert len(status.paid_members) == 1
        alex_summary = status.paid_members[0]
        assert alex_summary.roommate_id == "rm_alex"
        assert alex_summary.total_owed == 250.0
        assert alex_summary.total_paid == 250.0
        assert alex_summary.total_pending == 0.0
        assert alex_summary.is_cleared is True
        assert alex_summary.pending_shares_count == 0

        # Check pending_members (Priya, Rahul, Samira)
        assert len(status.pending_members) == 3
        pending_ids = {m.roommate_id for m in status.pending_members}
        assert pending_ids == {"rm_priya", "rm_rahul", "rm_sam"}
        for debtor in status.pending_members:
            assert debtor.total_owed == 250.0
            assert debtor.total_paid == 0.0
            assert debtor.total_pending == 250.0
            assert debtor.is_cleared is False
            assert debtor.pending_shares_count == 1
            assert debtor.highest_escalation_stage == EscalationStage.STAGE_1_ANNOUNCE

        # Check bills summary
        assert len(status.bills_summary) == 1
        bill = status.bills_summary[0]
        assert bill.expense_id == exp.id
        assert bill.total_amount == 1000.0
        assert bill.paid_count == 1
        assert bill.unpaid_count == 3
        assert bill.is_fully_settled is False

    def test_confirm_payment_real_time_transition(self):
        """Verifies that confirming an individual share transitions that member from pending to paid."""
        exp = agent.create_and_split_expense(
            household_id=DEFAULT_HOUSEHOLD_ID,
            payer_id="rm_alex",
            vendor="Wifi Fiber",
            total_amount=800.0,
            split_rule=SplitRuleType.EQUAL,
        )

        priya_share = next(s for s in exp.shares if s.roommate_id == "rm_priya")
        
        # Confirm Priya's payment
        agent.confirm_split_share_payment(share_id=priya_share.id, payment_ref="UPI/PRIYA_PAID")

        status = agent.get_household_settlement_status(household_id=DEFAULT_HOUSEHOLD_ID)
        assert status.total_paid == 400.0   # Alex (200) + Priya (200)
        assert status.total_pending == 400.0 # Rahul (200) + Samira (200)
        assert status.cleared_percentage == 50.0

        paid_ids = {m.roommate_id for m in status.paid_members}
        assert "rm_priya" in paid_ids
        assert "rm_alex" in paid_ids

        pending_ids = {m.roommate_id for m in status.pending_members}
        assert pending_ids == {"rm_rahul", "rm_sam"}

    def test_escalation_stage_urgency_hierarchy(self):
        """Verifies that a member's highest_escalation_stage reflects the most severe stage among their unpaid shares."""
        # Create 2 expenses
        exp1 = agent.create_and_split_expense(
            household_id=DEFAULT_HOUSEHOLD_ID,
            payer_id="rm_alex",
            vendor="Bill 1",
            total_amount=400.0,
            split_rule=SplitRuleType.EQUAL,
        )
        exp2 = agent.create_and_split_expense(
            household_id=DEFAULT_HOUSEHOLD_ID,
            payer_id="rm_alex",
            vendor="Bill 2",
            total_amount=400.0,
            split_rule=SplitRuleType.EQUAL,
        )

        # Set Rahul's share on exp1 to STAGE_2_NUDGE and on exp2 to STAGE_4_OVERDUE
        rahul_s1 = next(s for s in exp1.shares if s.roommate_id == "rm_rahul")
        rahul_s2 = next(s for s in exp2.shares if s.roommate_id == "rm_rahul")
        rahul_s1.escalation_stage = EscalationStage.STAGE_2_NUDGE
        rahul_s2.escalation_stage = EscalationStage.STAGE_4_OVERDUE
        storage.save_expense(exp1)
        storage.save_expense(exp2)

        status = agent.get_household_settlement_status(household_id=DEFAULT_HOUSEHOLD_ID)
        rahul_summary = next(m for m in status.pending_members if m.roommate_id == "rm_rahul")
        assert rahul_summary.highest_escalation_stage == EscalationStage.STAGE_4_OVERDUE
        assert rahul_summary.total_pending == 200.0  # 100 + 100
        assert rahul_summary.pending_shares_count == 2

    def test_debt_settlement_integration_matrix_update(self):
        """Resolving a graph debt settlement transfer clears outstanding debtor balances in real time."""
        exp = agent.create_and_split_expense(
            household_id=DEFAULT_HOUSEHOLD_ID,
            payer_id="rm_alex",
            vendor="Monthly Grocery Haul",
            total_amount=1200.0,
            split_rule=SplitRuleType.EQUAL,
        )

        # Samira owes Alex 300
        settlement_res = agent.confirm_debt_settlement(
            household_id=DEFAULT_HOUSEHOLD_ID,
            from_roommate_id="rm_sam",
            to_roommate_id="rm_alex",
            amount=300.0,
            payment_ref="UPI/GRAPH_SETTLE",
        )
        assert settlement_res["status"] == "success"

        status = agent.get_household_settlement_status(household_id=DEFAULT_HOUSEHOLD_ID)
        paid_ids = {m.roommate_id for m in status.paid_members}
        assert "rm_sam" in paid_ids

        samira_summary = next(m for m in status.paid_members if m.roommate_id == "rm_sam")
        assert samira_summary.is_cleared is True
        assert samira_summary.total_pending == 0.0


class TestSettlementStatusApiRoutesTDD:
    def setup_method(self):
        self.client = TestClient(app)

    def test_get_settlement_status_endpoint_200(self):
        """GET /api/households/{id}/settlement-status returns 200 with complete matrix."""
        # Add an expense first
        agent.create_and_split_expense(
            household_id=DEFAULT_HOUSEHOLD_ID,
            payer_id="rm_alex",
            vendor="Water Bill",
            total_amount=500.0,
            split_rule=SplitRuleType.EQUAL,
        )

        res = self.client.get(f"/api/households/{DEFAULT_HOUSEHOLD_ID}/settlement-status")
        assert res.status_code == 200
        data = res.json()
        assert data["household_id"] == DEFAULT_HOUSEHOLD_ID
        assert data["total_billed"] == 500.0
        assert data["total_paid"] == 125.0
        assert data["total_pending"] == 375.0
        assert data["cleared_percentage"] == 25.0
        assert len(data["paid_members"]) == 1
        assert len(data["pending_members"]) == 3
        assert len(data["bills_summary"]) == 1

    def test_get_settlement_status_not_found_404(self):
        """GET /api/households/{id}/settlement-status returns 404 for invalid household ID."""
        res = self.client.get("/api/households/non_existent_household_999/settlement-status")
        assert res.status_code == 404
        assert "not found" in res.json()["detail"].lower()
