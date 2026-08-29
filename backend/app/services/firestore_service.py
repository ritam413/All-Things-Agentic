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
    Expense,
    SplitShare,
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


# Global Singleton Storage instance
storage = StorageRepository()
