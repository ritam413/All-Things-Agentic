"""
Comprehensive Unit Test Suite for RoomieOps AI Core Tools.
Follows the tdd skill conventions: testing at seams with exact assertions.
Compatible with both pytest and python -m unittest.
"""

import sys
import unittest
from pathlib import Path
from datetime import date, timedelta

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import (
    Roommate,
    SplitRuleType,
    RawDebt,
    EscalationStage,
    HabitProfile,
    HabitBadge,
    ExpenseItem,
    SharePaymentStatus,
)
from backend.app.agent.tools.split_calculator import calculate_shares
from backend.app.agent.tools.debt_simplifier import simplify_household_debts
from backend.app.agent.tools.payment_links import generate_upi_deep_link, create_payment_intent
from backend.app.agent.tools.escalation_engine import evaluate_escalation_stage
from backend.app.agent.tools.memory_bank import update_habit_profile
from backend.app.agent.core import agent


def make_roommates():
    return [
        Roommate(id="rm_alex", name="Alex", email="alex@test.com", phone="123", upi_vpa="alex@okaxis", room_sq_ft=300.0, custom_split_pct=30.0, avg_settlement_hours=2.0),
        Roommate(id="rm_priya", name="Priya", email="priya@test.com", phone="124", upi_vpa="priya@paytm", room_sq_ft=400.0, custom_split_pct=40.0, avg_settlement_hours=12.0),
        Roommate(id="rm_rahul", name="Rahul", email="rahul@test.com", phone="125", upi_vpa="rahul@ybl", room_sq_ft=300.0, custom_split_pct=30.0, avg_settlement_hours=72.0),
    ]


class TestRoomieOpsCoreTools(unittest.TestCase):

    # --- 1. Split Calculator Invariants ---

    def test_equal_split_penny_conservation(self):
        rms = make_roommates()
        shares = calculate_shares(total_amount=100.00, split_rule=SplitRuleType.EQUAL, roommates=rms)
        self.assertEqual(len(shares), 3)
        total_split = sum(s.amount_owed for s in shares)
        self.assertEqual(round(total_split, 2), 100.00)

    def test_room_area_weighted_split(self):
        rms = make_roommates()
        shares = calculate_shares(total_amount=1000.00, split_rule=SplitRuleType.ROOM_AREA, roommates=rms)
        amounts = {s.roommate_id: s.amount_owed for s in shares}
        self.assertEqual(amounts["rm_alex"], 300.00)
        self.assertEqual(amounts["rm_priya"], 400.00)
        self.assertEqual(amounts["rm_rahul"], 300.00)
        self.assertEqual(sum(amounts.values()), 1000.00)

    def test_itemized_split_with_assigned_roommates(self):
        rms = make_roommates()
        items = [
            ExpenseItem(name="Item A (Alex only)", amount=30.00, category="GROCERIES", assigned_roommate_ids=["rm_alex"]),
            ExpenseItem(name="Item B (Priya & Rahul)", amount=70.00, category="GROCERIES", assigned_roommate_ids=["rm_priya", "rm_rahul"]),
        ]
        shares = calculate_shares(total_amount=100.00, split_rule=SplitRuleType.ITEMIZED, roommates=rms, items=items)
        amounts = {s.roommate_id: s.amount_owed for s in shares}
        self.assertEqual(amounts["rm_alex"], 30.00)
        self.assertEqual(amounts["rm_priya"], 35.00)
        self.assertEqual(amounts["rm_rahul"], 35.00)
        self.assertEqual(round(sum(amounts.values()), 2), 100.00)

    # --- 2. Debt Simplifier Graph Reduction ---

    def test_circular_debt_reduction(self):
        debts = [
            RawDebt(debtor_id="rm_a", debtor_name="Alice", creditor_id="rm_b", creditor_name="Bob", amount=30.0),
            RawDebt(debtor_id="rm_b", debtor_name="Bob", creditor_id="rm_c", creditor_name="Charlie", amount=30.0),
            RawDebt(debtor_id="rm_c", debtor_name="Charlie", creditor_id="rm_a", creditor_name="Alice", amount=30.0),
        ]
        result = simplify_household_debts(debts)
        self.assertEqual(result.simplified_transfers_count, 0)
        self.assertEqual(len(result.settlements), 0)

    def test_complex_debt_simplification_bound(self):
        debts = [
            RawDebt(debtor_id="rm_b", debtor_name="Bob", creditor_id="rm_a", creditor_name="Alice", amount=40.0),
            RawDebt(debtor_id="rm_c", debtor_name="Charlie", creditor_id="rm_a", creditor_name="Alice", amount=60.0),
            RawDebt(debtor_id="rm_d", debtor_name="Dave", creditor_id="rm_b", creditor_name="Bob", amount=20.0),
            RawDebt(debtor_id="rm_d", debtor_name="Dave", creditor_id="rm_c", creditor_name="Charlie", amount=30.0),
            RawDebt(debtor_id="rm_a", debtor_name="Alice", creditor_id="rm_d", creditor_name="Dave", amount=10.0),
            RawDebt(debtor_id="rm_c", debtor_name="Charlie", creditor_id="rm_b", creditor_name="Bob", amount=10.0),
        ]
        result = simplify_household_debts(debts)
        self.assertLessEqual(result.simplified_transfers_count, 3)
        self.assertLess(result.simplified_transfers_count, len(debts))

    # --- 3. Payment Links ---

    def test_upi_deep_link_format(self):
        link = generate_upi_deep_link(
            payee_vpa="alex@okaxis",
            payee_name="Alex Chen",
            amount=1450.00,
            transaction_note="Wifi Bill"
        )
        self.assertTrue(link.startswith("upi://pay?"))
        self.assertIn("pa=alex@okaxis", link)
        self.assertIn("am=1450.00", link)
        self.assertIn("cu=INR", link)

    # --- 4. Escalation Tone Progression ---

    def test_escalation_stage_transitions(self):
        today = date.today()
        
        # 5 days in future -> Stage 1 Announce
        stage, _, sev = evaluate_escalation_stage((today + timedelta(days=5)).isoformat(), today)
        self.assertEqual(stage, EscalationStage.STAGE_1_ANNOUNCE)
        self.assertEqual(sev, "INFO")

        # 2 days in future -> Stage 2 Nudge
        stage, _, sev = evaluate_escalation_stage((today + timedelta(days=2)).isoformat(), today)
        self.assertEqual(stage, EscalationStage.STAGE_2_NUDGE)

        # Due today -> Stage 3 Deadline
        stage, _, sev = evaluate_escalation_stage(today.isoformat(), today)
        self.assertEqual(stage, EscalationStage.STAGE_3_DEADLINE)
        self.assertEqual(sev, "WARNING")

        # 3 days ago -> Stage 4 Overdue
        stage, _, sev = evaluate_escalation_stage((today - timedelta(days=3)).isoformat(), today)
        self.assertEqual(stage, EscalationStage.STAGE_4_OVERDUE)
        self.assertEqual(sev, "ALERT")

    # --- 5. Memory Bank Profiling ---

    def test_habit_profile_badges(self):
        profile = HabitProfile(
            roommate_id="rm_test",
            roommate_name="Test",
            avg_settlement_hours=2.0,
            on_time_ratio=1.0,
            total_bills_settled=4,
            consecutive_late_count=0,
            habit_badge=HabitBadge.RAPID_SETTLER,
        )
        
        # Late payment updates consecutive late count
        updated = update_habit_profile(profile, settled_hours=96.0, was_on_time=False)
        self.assertEqual(updated.consecutive_late_count, 1)
        
        # Second consecutive late payment triggers Chronic Late badge
        updated_again = update_habit_profile(updated, settled_hours=120.0, was_on_time=False)
        self.assertEqual(updated_again.habit_badge, HabitBadge.CHRONIC_LATE)


if __name__ == "__main__":
    unittest.main()
