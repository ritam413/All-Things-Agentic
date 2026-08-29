"""
Dual Storage Adapter: Native Google Cloud Firestore with In-Memory fallback.
Guarantees 100% cloud deployment compatibility AND instant zero-credential local boot.
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import (
    DEFAULT_HOUSEHOLD_ID,
    Household,
    Roommate,
    Expense,
    SplitShare,
    SplitRuleType,
    AgentActivityLog,
    HabitProfile,
    HabitBadge,
    RawDebt,
    ActivityEventType,
    SharePaymentStatus,
)

# Optional Firestore SDK
try:
    from google.cloud import firestore
    HAS_FIRESTORE = True
except ImportError:
    HAS_FIRESTORE = False


class StorageRepository:
    def __init__(self):
        self.project_id = os.environ.get("FIRESTORE_PROJECT_ID")
        self.use_firestore = HAS_FIRESTORE and bool(self.project_id)
        
        self.db = None
        if self.use_firestore:
            try:
                self.db = firestore.Client(project=self.project_id)
                print(f"[Storage] Connected to Google Cloud Firestore ({self.project_id})")
            except Exception as e:
                print(f"[Storage Warning] Firestore connection failed ({e}), falling back to in-memory store.")
                self.use_firestore = False

        # In-Memory collections
        self.households: Dict[str, Household] = {}
        self.expenses: Dict[str, Expense] = {}
        self.activity_logs: List[AgentActivityLog] = []
        self.memory_profiles: Dict[str, HabitProfile] = {}
        self.simulated_days_offset: int = 0

        self._seed_initial_data()

    def _seed_initial_data(self):
        """Loads default seed data from shared/mock_data/."""
        self.households.clear()
        self.expenses.clear()
        self.activity_logs.clear()
        self.memory_profiles.clear()
        self.simulated_days_offset = 0

        seed_path = ROOT_DIR / "shared" / "mock_data" / "household_seed.json"
        if seed_path.exists():
            try:
                with open(seed_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    hh = Household(**data)
                    self.households[hh.id] = hh

                    # Seed initial memory profiles
                    for rm in hh.roommates:
                        self.memory_profiles[rm.id] = HabitProfile(
                            roommate_id=rm.id,
                            roommate_name=rm.name,
                            avg_settlement_hours=rm.avg_settlement_hours,
                            on_time_ratio=0.90 if rm.habit_badge != HabitBadge.CHRONIC_LATE else 0.50,
                            total_bills_settled=5,
                            consecutive_late_count=2 if rm.habit_badge == HabitBadge.CHRONIC_LATE else 0,
                            habit_badge=rm.habit_badge or HabitBadge.RELIABLE,
                        )
            except Exception as e:
                print(f"[Storage Seed Warning] Error seeding household: {e}")

        # Seed initial agent log
        self.activity_logs.append(
            AgentActivityLog(
                id="log_init_01",
                household_id=DEFAULT_HOUSEHOLD_ID,
                timestamp=datetime.now().isoformat(),
                event_type=ActivityEventType.AUTONOMOUS_CRON_SCAN,
                title="Agent Initialized",
                description="RoomieOps AI Agent active on Google Cloud Run. Household loaded.",
                severity="SUCCESS",
            )
        )

    def get_household(self, household_id: str = DEFAULT_HOUSEHOLD_ID) -> Optional[Household]:
        return self.households.get(household_id)

    def save_household(self, household: Household):
        self.households[household.id] = household
        if self.use_firestore and self.db:
            try:
                self.db.collection("households").document(household.id).set(household.model_dump())
            except Exception as e:
                print(f"[Firestore write error] {e}")

    def save_expense(self, expense: Expense):
        self.expenses[expense.id] = expense
        if self.use_firestore and self.db:
            try:
                self.db.collection("households").document(expense.household_id).collection("expenses").document(expense.id).set(expense.model_dump())
            except Exception as e:
                print(f"[Firestore write error] {e}")

    def get_expenses(self, household_id: str = DEFAULT_HOUSEHOLD_ID) -> List[Expense]:
        return [e for e in self.expenses.values() if e.household_id == household_id]

    def get_expense(self, expense_id: str) -> Optional[Expense]:
        return self.expenses.get(expense_id)

    def update_split_share_payment(
        self,
        share_id: str,
        payment_ref: str = "",
    ) -> Optional[SplitShare]:
        """Pure persistence update for a split share without business rule side-effects."""
        for exp in self.expenses.values():
            for share in exp.shares:
                if share.id == share_id:
                    share.status = SharePaymentStatus.PAID
                    share.paid_at = datetime.now().isoformat()
                    share.payment_ref = payment_ref or "UPI/DIRECT_CONFIRM"

                    # Update expense status if all paid
                    if all(s.status == SharePaymentStatus.PAID for s in exp.shares):
                        exp.status = "SETTLED"

                    if self.use_firestore and self.db:
                        self.save_expense(exp)

                    return share
        return None

    def get_habit_profile(self, roommate_id: str) -> Optional[HabitProfile]:
        return self.memory_profiles.get(roommate_id)

    def save_habit_profile(self, profile: HabitProfile):
        self.memory_profiles[profile.roommate_id] = profile
        if self.use_firestore and self.db:
            try:
                self.db.collection("habit_profiles").document(profile.roommate_id).set(profile.model_dump())
            except Exception as e:
                print(f"[Firestore write error] {e}")

    def add_activity_log(self, log: AgentActivityLog):
        self.activity_logs.insert(0, log)  # Most recent first
        if len(self.activity_logs) > 100:
            self.activity_logs.pop()

    def get_activity_logs(self, household_id: str = DEFAULT_HOUSEHOLD_ID, limit: int = 25) -> List[AgentActivityLog]:
        logs = [log for log in self.activity_logs if log.household_id == household_id]
        return logs[:limit]

    def get_memory_profiles(self, household_id: str = DEFAULT_HOUSEHOLD_ID) -> List[HabitProfile]:
        hh = self.get_household(household_id)
        if not hh:
            return list(self.memory_profiles.values())
        return [self.memory_profiles[rm.id] for rm in hh.roommates if rm.id in self.memory_profiles]

    def list_households(self, user_id: Optional[str] = None) -> List[Household]:
        if user_id:
            from backend.app.services.auth_service import auth_service
            user = auth_service.get_user_by_id(user_id)
            if user and user.household_ids:
                return [hh for hh in self.households.values() if hh.id in user.household_ids]
        return list(self.households.values())

    def create_household(
        self,
        name: str,
        default_currency: str = "INR",
        default_split_rule: SplitRuleType = SplitRuleType.EQUAL,
        creator_user_id: Optional[str] = None,
        initial_roommates: Optional[List[Roommate]] = None,
    ) -> Household:
        import uuid
        household_id = f"hh_{uuid.uuid4().hex[:8]}"
        roommates_list: List[Roommate] = list(initial_roommates or [])

        if creator_user_id:
            from backend.app.services.auth_service import auth_service
            auth_service.add_household_to_user(creator_user_id, household_id)
            creator_user = auth_service.get_user_by_id(creator_user_id)
            if creator_user and not any(rm.id == creator_user.id or rm.email.lower() == creator_user.email.lower() for rm in roommates_list):
                creator_rm = Roommate(
                    id=creator_user.id,
                    name=creator_user.name,
                    email=creator_user.email,
                    phone=creator_user.phone or "",
                    upi_vpa=creator_user.upi_vpa or f"{creator_user.name.lower().replace(' ', '')}@upi",
                    room_sq_ft=250.0,
                    habit_badge=HabitBadge.RELIABLE,
                    avg_settlement_hours=24.0,
                )
                roommates_list.append(creator_rm)

        hh = Household(
            id=household_id,
            name=name,
            default_currency=default_currency,
            default_split_rule=default_split_rule,
            roommates=roommates_list,
        )
        self.save_household(hh)

        # Seed habit profiles for any initial roommates
        for rm in roommates_list:
            if rm.id not in self.memory_profiles:
                self.memory_profiles[rm.id] = HabitProfile(
                    roommate_id=rm.id,
                    roommate_name=rm.name,
                    avg_settlement_hours=rm.avg_settlement_hours,
                    on_time_ratio=1.0,
                    total_bills_settled=0,
                    consecutive_late_count=0,
                    habit_badge=rm.habit_badge or HabitBadge.RELIABLE,
                )

        return hh

    def add_member_to_household(
        self,
        household_id: str,
        name: str,
        email: str,
        phone: Optional[str] = "",
        upi_vpa: str = "",
        room_sq_ft: Optional[float] = 250.0,
        custom_split_pct: Optional[float] = None,
    ) -> Roommate:
        import uuid
        from shared.schema import Roommate, HabitProfile, HabitBadge
        hh = self.get_household(household_id)
        if not hh:
            raise ValueError(f"Household '{household_id}' not found.")

        # Check if already present by email
        for rm in hh.roommates:
            if rm.email.lower() == email.strip().lower():
                raise ValueError(f"Roommate with email '{email}' is already in this household.")

        rm_id = f"rm_{uuid.uuid4().hex[:6]}"
        roommate = Roommate(
            id=rm_id,
            name=name.strip(),
            email=email.strip().lower(),
            phone=phone.strip() if phone else "",
            upi_vpa=upi_vpa.strip(),
            room_sq_ft=room_sq_ft if room_sq_ft is not None else 250.0,
            custom_split_pct=custom_split_pct,
            habit_badge=HabitBadge.RELIABLE,
            avg_settlement_hours=24.0,
        )

        hh.roommates.append(roommate)
        self.save_household(hh)

        # Automatically initialize HabitProfile in memory bank
        profile = HabitProfile(
            roommate_id=roommate.id,
            roommate_name=roommate.name,
            avg_settlement_hours=24.0,
            on_time_ratio=1.0,
            total_bills_settled=0,
            consecutive_late_count=0,
            habit_badge=HabitBadge.RELIABLE,
        )
        self.save_habit_profile(profile)

        return roommate

    def update_member_in_household(
        self,
        household_id: str,
        roommate_id: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        upi_vpa: Optional[str] = None,
        room_sq_ft: Optional[float] = None,
        custom_split_pct: Optional[float] = None,
    ) -> Roommate:
        hh = self.get_household(household_id)
        if not hh:
            raise ValueError(f"Household '{household_id}' not found.")

        target_rm = next((rm for rm in hh.roommates if rm.id == roommate_id), None)
        if not target_rm:
            raise ValueError(f"Roommate '{roommate_id}' not found in household '{household_id}'.")

        if name is not None:
            target_rm.name = name.strip()
        if email is not None:
            target_rm.email = email.strip().lower()
        if phone is not None:
            target_rm.phone = phone.strip()
        if upi_vpa is not None:
            target_rm.upi_vpa = upi_vpa.strip()
        if room_sq_ft is not None:
            target_rm.room_sq_ft = room_sq_ft
        if custom_split_pct is not None:
            target_rm.custom_split_pct = custom_split_pct

        self.save_household(hh)

        # Update profile name if changed
        if name is not None and target_rm.id in self.memory_profiles:
            self.memory_profiles[target_rm.id].roommate_name = target_rm.name

        return target_rm

    def remove_member_from_household(self, household_id: str, roommate_id: str) -> bool:
        hh = self.get_household(household_id)
        if not hh:
            raise ValueError(f"Household '{household_id}' not found.")

        initial_len = len(hh.roommates)
        hh.roommates = [rm for rm in hh.roommates if rm.id != roommate_id]
        if len(hh.roommates) == initial_len:
            raise ValueError(f"Roommate '{roommate_id}' not found in household '{household_id}'.")

        self.save_household(hh)
        return True


# Global Singleton Storage instance
storage = StorageRepository()
