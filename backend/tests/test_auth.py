"""
TDD Test Suite for Ticket T-16: AI & Backend Auth Service & User Profile API.
Verifies registration, login, token authentication, profile updates, demo personas, and fast persona switching.
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.auth_service import auth_service, AuthService
from shared.schema import (
    User,
    AuthToken,
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileUpdateRequest,
    DEFAULT_HOUSEHOLD_ID,
)


@pytest.fixture(autouse=True)
def reset_auth_service():
    """Resets the auth service before each test."""
    auth_service.reset_to_default_personas()
    yield


@pytest.fixture
def client():
    return TestClient(app)


class TestAuthServiceTDD:
    """Unit tests for AuthService logic."""

    def test_default_demo_personas_seeded(self):
        """Validates that the 4 default household roommates exist as demo personas."""
        personas = auth_service.get_demo_personas()
        assert len(personas) >= 4
        emails = [p.email for p in personas]
        assert "alex.chen@example.com" in emails
        assert "priya.sharma@example.com" in emails
        assert "rahul.verma@example.com" in emails
        assert "samira.k@example.com" in emails

        # Ensure household association
        for p in personas:
            assert DEFAULT_HOUSEHOLD_ID in p.household_ids
            assert p.avatar_url is not None

    def test_register_new_user_success(self):
        """Validates registering a new user with password hashing."""
        req = UserRegisterRequest(
            name="Maya Patel",
            email="maya.patel@example.com",
            password="securePassword123!",
            phone="+919811122233",
            upi_vpa="maya@oksbi",
        )
        auth_token = auth_service.register_user(req)
        assert isinstance(auth_token, AuthToken)
        assert auth_token.user.name == "Maya Patel"
        assert auth_token.user.email == "maya.patel@example.com"
        assert auth_token.user.upi_vpa == "maya@oksbi"
        assert auth_token.access_token is not None
        assert len(auth_token.access_token) > 16

        # Token lookup
        user_lookup = auth_service.get_user_by_token(auth_token.access_token)
        assert user_lookup is not None
        assert user_lookup.id == auth_token.user.id

    def test_register_duplicate_email_raises_error(self):
        """Validates that registering an existing email raises ValueError."""
        req = UserRegisterRequest(
            name="Alex Duplicate",
            email="alex.chen@example.com",
            password="anotherPassword",
        )
        with pytest.raises(ValueError, match="already registered"):
            auth_service.register_user(req)

    def test_login_valid_and_invalid_credentials(self):
        """Validates login with correct vs incorrect credentials."""
        # Pre-seeded persona login (default password 'password123')
        login_req = UserLoginRequest(
            email="priya.sharma@example.com",
            password="password123",
        )
        token = auth_service.login_user(login_req)
        assert token is not None
        assert token.user.name == "Priya Sharma"

        # Invalid password
        bad_req = UserLoginRequest(
            email="priya.sharma@example.com",
            password="wrongPassword",
        )
        with pytest.raises(ValueError, match="Invalid credentials"):
            auth_service.login_user(bad_req)

        # Non-existent user
        missing_req = UserLoginRequest(
            email="ghost@example.com",
            password="password123",
        )
        with pytest.raises(ValueError, match="Invalid credentials"):
            auth_service.login_user(missing_req)

    def test_profile_update(self):
        """Validates updating user profile fields."""
        personas = auth_service.get_demo_personas()
        alex = personas[0]

        update_req = UserProfileUpdateRequest(
            name="Alexander Chen",
            phone="+919999888777",
            upi_vpa="alex.chen@okicici",
        )
        updated_user = auth_service.update_profile(alex.id, update_req)
        assert updated_user.name == "Alexander Chen"
        assert updated_user.phone == "+919999888777"
        assert updated_user.upi_vpa == "alex.chen@okicici"
        assert updated_user.email == alex.email  # unchanged

    def test_switch_persona_shortcut(self):
        """Validates one-tap persona switching."""
        token = auth_service.switch_persona("rm_rahul")
        assert token.user.name == "Rahul Verma"
        assert token.user.id == "usr_rahul" or token.user.id == "rm_rahul"
        assert token.access_token is not None


class TestAuthApiRoutesTDD:
    """Integration tests for FastAPI /api/auth/* endpoints."""

    def test_get_personas_endpoint(self, client: TestClient):
        res = client.get("/api/auth/personas")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) >= 4
        assert any(u["email"] == "alex.chen@example.com" for u in data)

    def test_switch_persona_endpoint(self, client: TestClient):
        res = client.post("/api/auth/switch-persona/rm_priya")
        assert res.status_code == 200
        data = res.json()
        assert data["user"]["name"] == "Priya Sharma"
        assert "access_token" in data

    def test_register_and_me_endpoints(self, client: TestClient):
        # Register
        reg_payload = {
            "name": "Dev Sharma",
            "email": "dev.sharma@example.com",
            "password": "passWordDev99",
            "phone": "+919876500000",
            "upi_vpa": "dev@upi",
        }
        res = client.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 200
        token_data = res.json()
        token = token_data["access_token"]
        assert token_data["user"]["name"] == "Dev Sharma"

        # GET /me with Bearer token
        res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res_me.status_code == 200
        me_data = res_me.json()
        assert me_data["email"] == "dev.sharma@example.com"

        # PATCH /profile
        patch_payload = {
            "name": "Dev K. Sharma",
            "upi_vpa": "devsharma@okhdfc",
        }
        res_patch = client.patch(
            "/api/auth/profile",
            json=patch_payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res_patch.status_code == 200
        assert res_patch.json()["name"] == "Dev K. Sharma"
        assert res_patch.json()["upi_vpa"] == "devsharma@okhdfc"

    def test_login_endpoint(self, client: TestClient):
        # Valid login
        login_payload = {
            "email": "alex.chen@example.com",
            "password": "password123",
        }
        res = client.post("/api/auth/login", json=login_payload)
        assert res.status_code == 200
        assert res.json()["user"]["name"] == "Alex Chen"

        # Invalid login
        bad_payload = {
            "email": "alex.chen@example.com",
            "password": "wrongpassword",
        }
        res_bad = client.post("/api/auth/login", json=bad_payload)
        assert res_bad.status_code == 401
