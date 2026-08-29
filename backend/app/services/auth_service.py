"""
Authentication and User Profile Service for RoomieOps AI.
Provides session token management, user registration, login, profile updates, and fast demo persona switching.
"""

import hashlib
import secrets
from datetime import datetime, timezone
from typing import Dict, List, Optional

from shared.schema import (
    User,
    AuthToken,
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileUpdateRequest,
    DEFAULT_HOUSEHOLD_ID,
)


class AuthService:
    """Service handling user credentials, tokens, profiles, and demo personas."""

    def __init__(self):
        self._users: Dict[str, User] = {}
        self._passwords: Dict[str, str] = {}  # user_id -> password_hash
        self._tokens: Dict[str, str] = {}  # token -> user_id
        self._email_to_id: Dict[str, str] = {}  # email.lower() -> user_id
        self._salt = "roomieops_auth_salt_2026"
        self.reset_to_default_personas()

    def _hash_password(self, password: str) -> str:
        salted = f"{self._salt}:{password}".encode("utf-8")
        return hashlib.sha256(salted).hexdigest()

    def reset_to_default_personas(self):
        """Seeds or resets default demo personas matching household_seed.json."""
        self._users.clear()
        self._passwords.clear()
        self._tokens.clear()
        self._email_to_id.clear()

        default_personas = [
            {
                "id": "rm_alex",
                "name": "Alex Chen",
                "email": "alex.chen@example.com",
                "phone": "+919876543210",
                "upi_vpa": "alex@okaxis",
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
                "household_ids": [DEFAULT_HOUSEHOLD_ID],
            },
            {
                "id": "rm_priya",
                "name": "Priya Sharma",
                "email": "priya.sharma@example.com",
                "phone": "+919876543211",
                "upi_vpa": "priya@paytm",
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
                "household_ids": [DEFAULT_HOUSEHOLD_ID],
            },
            {
                "id": "rm_rahul",
                "name": "Rahul Verma",
                "email": "rahul.verma@example.com",
                "phone": "+919876543212",
                "upi_vpa": "rahul@ybl",
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
                "household_ids": [DEFAULT_HOUSEHOLD_ID],
            },
            {
                "id": "rm_sam",
                "name": "Samira Khan",
                "email": "samira.k@example.com",
                "phone": "+919876543213",
                "upi_vpa": "samira@icici",
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Samira",
                "household_ids": [DEFAULT_HOUSEHOLD_ID],
            },
        ]

        for p in default_personas:
            user = User(
                id=p["id"],
                name=p["name"],
                email=p["email"],
                phone=p["phone"],
                upi_vpa=p["upi_vpa"],
                avatar_url=p["avatar_url"],
                household_ids=p["household_ids"],
                created_at="2026-08-29T10:00:00Z",
            )
            self._users[user.id] = user
            self._passwords[user.id] = self._hash_password("password123")
            self._email_to_id[user.email.lower()] = user.id

    def get_demo_personas(self) -> List[User]:
        """Returns all registered demo users."""
        return list(self._users.values())

    def register_user(self, req: UserRegisterRequest, household_id: Optional[str] = None) -> AuthToken:
        """Registers a new user and issues an auth token."""
        email_clean = req.email.strip().lower()
        if email_clean in self._email_to_id:
            raise ValueError(f"Email '{req.email}' is already registered.")

        user_id = f"usr_{secrets.token_hex(6)}"
        household_ids = [household_id or DEFAULT_HOUSEHOLD_ID]

        user = User(
            id=user_id,
            name=req.name.strip(),
            email=email_clean,
            phone=req.phone or "",
            upi_vpa=req.upi_vpa or "",
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.name.strip()}",
            household_ids=household_ids,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

        self._users[user.id] = user
        self._passwords[user.id] = self._hash_password(req.password)
        self._email_to_id[email_clean] = user.id

        token = self._generate_token_for_user(user.id)
        return AuthToken(access_token=token, token_type="bearer", user=user)

    def login_user(self, req: UserLoginRequest) -> AuthToken:
        """Authenticates user with email and password."""
        email_clean = req.email.strip().lower()
        user_id = self._email_to_id.get(email_clean)
        if not user_id:
            raise ValueError("Invalid credentials.")

        expected_hash = self._passwords.get(user_id)
        if expected_hash != self._hash_password(req.password):
            raise ValueError("Invalid credentials.")

        user = self._users[user_id]
        token = self._generate_token_for_user(user.id)
        return AuthToken(access_token=token, token_type="bearer", user=user)

    def switch_persona(self, persona_id: str) -> AuthToken:
        """Switches session immediately to the given persona ID or roommate ID."""
        user = self._users.get(persona_id)
        if not user:
            # Try searching by matching ID prefix
            for u in self._users.values():
                if u.id == persona_id or u.id.replace("usr_", "rm_") == persona_id or u.id.replace("rm_", "usr_") == persona_id:
                    user = u
                    break
        if not user:
            raise ValueError(f"Persona '{persona_id}' not found.")

        token = self._generate_token_for_user(user.id)
        return AuthToken(access_token=token, token_type="bearer", user=user)

    def _generate_token_for_user(self, user_id: str) -> str:
        token = f"tok_{secrets.token_urlsafe(32)}"
        self._tokens[token] = user_id
        return token

    def get_user_by_token(self, token: str) -> Optional[User]:
        """Retrieves user associated with a given bearer token."""
        user_id = self._tokens.get(token)
        if not user_id:
            return None
        return self._users.get(user_id)

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self._users.get(user_id)

    def update_profile(self, user_id: str, req: UserProfileUpdateRequest) -> User:
        """Updates user profile information."""
        user = self._users.get(user_id)
        if not user:
            raise ValueError(f"User '{user_id}' not found.")

        update_dict = user.model_dump()
        if req.name is not None:
            update_dict["name"] = req.name.strip()
        if req.phone is not None:
            update_dict["phone"] = req.phone.strip()
        if req.upi_vpa is not None:
            update_dict["upi_vpa"] = req.upi_vpa.strip()
        if req.avatar_url is not None:
            update_dict["avatar_url"] = req.avatar_url

        updated_user = User(**update_dict)
        self._users[user_id] = updated_user
        return updated_user

    def add_household_to_user(self, user_id: str, household_id: str):
        """Adds a household ID to a user's household list if not already present."""
        user = self._users.get(user_id)
        if user and household_id not in user.household_ids:
            user.household_ids.append(household_id)


# Global singleton instance
auth_service = AuthService()
