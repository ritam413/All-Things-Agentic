"""
Unit Tests for Ticket T-03: Configurable Split Calculation Engine.
Strict TDD tests asserting exact penny conservation across all 4 split algorithms:
EQUAL, ROOM_AREA, PERCENTAGE, and ITEMIZED.
"""

import sys
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import (
    Roommate,
    SplitRuleType,
    SplitShare,
    ExpenseItem,
    SharePaymentStatus,
    EscalationStage,
)
from backend.app.agent.tools.split_calculator import calculate_shares


def create_standard_household():
    """Returns 4 standard roommates with realistic areas and percentages."""
    return [
        Roommate(
            id="rm_alex",
            name="Alex Chen",
            email="alex@example.com",
            phone="111",
            upi_vpa="alex@okaxis",
            room_sq_ft=350.0,
            custom_split_pct=35.0,
            avg_settlement_hours=2.0,
        ),
        Roommate(
            id="rm_priya",
            name="Priya Sharma",
            email="priya@example.com",
            phone="222",
            upi_vpa="priya@paytm",
            room_sq_ft=250.0,
            custom_split_pct=25.0,
            avg_settlement_hours=12.0,
        ),
        Roommate(
            id="rm_rahul",
            name="Rahul Verma",
            email="rahul@example.com",
            phone="333",
            upi_vpa="rahul@ybl",
            room_sq_ft=220.0,
            custom_split_pct=22.0,
            avg_settlement_hours=72.0,
        ),
        Roommate(
            id="rm_sam",
            name="Samira Khan",
            email="samira@example.com",
            phone="444",
            upi_vpa="samira@icici",
            room_sq_ft=180.0,
            custom_split_pct=18.0,
            avg_settlement_hours=6.0,
        ),
    ]


class TestSplitCalculatorTDD(unittest.TestCase):
    """TDD test cases at the calculate_shares seam."""

    # --- Vertical Slice 1: EQUAL Split ---

    def test_equal_split_3_roommates_penny_conservation(self):
        """₹100.00 / 3 must equal 33.34, 33.33, 33.33 -> Sum = 100.00 exactly."""
        rms = create_standard_household()[:3]
        shares = calculate_shares(
            total_amount=100.00,
            split_rule=SplitRuleType.EQUAL,
            roommates=rms,
            expense_id="exp_eq3",
        )
        self.assertEqual(len(shares), 3)
        self.assertEqual(shares[0].amount_owed, 33.34)
        self.assertEqual(shares[1].amount_owed, 33.33)
        self.assertEqual(shares[2].amount_owed, 33.33)
        self.assertEqual(round(sum(s.amount_owed for s in shares), 2), 100.00)

    def test_equal_split_7_roommates_penny_remainder(self):
        """₹100.00 / 7 must distribute remainder 2 cents to first 2 roommates."""
        rms = [
            Roommate(id=f"rm_{i}", name=f"User {i}", email=f"u{i}@test.com", phone="000", upi_vpa=f"u{i}@upi", avg_settlement_hours=1.0)
            for i in range(7)
        ]
        shares = calculate_shares(
            total_amount=100.00,
            split_rule=SplitRuleType.EQUAL,
            roommates=rms,
            expense_id="exp_eq7",
        )
        self.assertEqual(len(shares), 7)
        # 10000 // 7 = 1428, remainder = 4 -> first 4 get 14.29, next 3 get 14.28
        self.assertEqual(shares[0].amount_owed, 14.29)
        self.assertEqual(shares[1].amount_owed, 14.29)
        self.assertEqual(shares[2].amount_owed, 14.29)
        self.assertEqual(shares[3].amount_owed, 14.29)
        self.assertEqual(shares[4].amount_owed, 14.28)
        self.assertEqual(shares[5].amount_owed, 14.28)
        self.assertEqual(shares[6].amount_owed, 14.28)
        self.assertEqual(round(sum(s.amount_owed for s in shares), 2), 100.00)

    # --- Vertical Slice 2: ROOM_AREA Proportional Split ---

    def test_room_area_weighted_split_exact_sum(self):
        """₹60,000.00 rent split proportional to [350, 250, 220, 180] sq ft (1000 sq ft total)."""
        rms = create_standard_household()
        shares = calculate_shares(
            total_amount=60000.00,
            split_rule=SplitRuleType.ROOM_AREA,
            roommates=rms,
            expense_id="exp_rent",
        )
        amounts = {s.roommate_id: s.amount_owed for s in shares}
        self.assertEqual(amounts["rm_alex"], 21000.00)
        self.assertEqual(amounts["rm_priya"], 15000.00)
        self.assertEqual(amounts["rm_rahul"], 13200.00)
        self.assertEqual(amounts["rm_sam"], 10800.00)
        self.assertEqual(round(sum(amounts.values()), 2), 60000.00)

    def test_room_area_zero_area_fallback(self):
        """If all room areas sum to 0.0, fallback smoothly to equal split."""
        rms = [
            Roommate(id="rm_1", name="R1", email="r1@test.com", phone="1", upi_vpa="r1@upi", room_sq_ft=0.0, avg_settlement_hours=1.0),
            Roommate(id="rm_2", name="R2", email="r2@test.com", phone="2", upi_vpa="r2@upi", room_sq_ft=0.0, avg_settlement_hours=1.0),
        ]
        shares = calculate_shares(
            total_amount=50.00,
            split_rule=SplitRuleType.ROOM_AREA,
            roommates=rms,
            expense_id="exp_zero_sqft",
        )
        self.assertEqual(len(shares), 2)
        self.assertEqual(shares[0].amount_owed, 25.00)
        self.assertEqual(shares[1].amount_owed, 25.00)

    # --- Vertical Slice 3: PERCENTAGE Custom Split ---

    def test_percentage_split_custom_weights(self):
        """₹3280.50 grocery bill split by [35%, 25%, 22%, 18%]."""
        rms = create_standard_household()
        shares = calculate_shares(
            total_amount=3280.50,
            split_rule=SplitRuleType.PERCENTAGE,
            roommates=rms,
            expense_id="exp_pct",
        )
        amounts = {s.roommate_id: s.amount_owed for s in shares}
        self.assertEqual(amounts["rm_alex"], 1148.17)
        self.assertEqual(amounts["rm_priya"], 820.12)
        self.assertEqual(amounts["rm_rahul"], 721.71)
        self.assertEqual(amounts["rm_sam"], 590.50)
        self.assertEqual(round(sum(amounts.values()), 2), 3280.50)

    def test_percentage_missing_values_fallback(self):
        """If custom_split_pct is None, fallback evenly."""
        rms = [
            Roommate(id="rm_1", name="R1", email="r1@test.com", phone="1", upi_vpa="r1@upi", custom_split_pct=None, avg_settlement_hours=1.0),
            Roommate(id="rm_2", name="R2", email="r2@test.com", phone="2", upi_vpa="r2@upi", custom_split_pct=None, avg_settlement_hours=1.0),
        ]
        shares = calculate_shares(
            total_amount=100.00,
            split_rule=SplitRuleType.PERCENTAGE,
            roommates=rms,
            expense_id="exp_nopct",
        )
        self.assertEqual(shares[0].amount_owed, 50.00)
        self.assertEqual(shares[1].amount_owed, 50.00)

    # --- Vertical Slice 4: ITEMIZED Split with Roommate Subsets ---

    def test_itemized_split_assigned_subsets_and_tax_distribution(self):
        """
        ₹100.00 total bill:
        - Item 1: ₹30.00 (Alex only)
        - Item 2: ₹60.00 (Priya & Rahul)
        - Unassigned difference: ₹10.00 distributed across all 3 roommates (3.34, 3.33, 3.33)
        Totals: Alex: 33.34, Priya: 33.33, Rahul: 33.33 -> Sum = 100.00
        """
        rms = create_standard_household()[:3]
        items = [
            ExpenseItem(name="Special Coffee", amount=30.00, category="GROCERIES", assigned_roommate_ids=["rm_alex"]),
            ExpenseItem(name="Pantry Essentials", amount=60.00, category="GROCERIES", assigned_roommate_ids=["rm_priya", "rm_rahul"]),
        ]
        shares = calculate_shares(
            total_amount=100.00,
            split_rule=SplitRuleType.ITEMIZED,
            roommates=rms,
            expense_id="exp_item",
            items=items,
        )
        amounts = {s.roommate_id: s.amount_owed for s in shares}
        self.assertEqual(amounts["rm_alex"], 33.34)
        self.assertEqual(amounts["rm_priya"], 33.33)
        self.assertEqual(amounts["rm_rahul"], 33.33)
        self.assertEqual(round(sum(amounts.values()), 2), 100.00)

    # --- Vertical Slice 5: Payer Status & Boundary Edges ---

    def test_payer_flagging_and_ids(self):
        """Payer should have status=PAID, other roommates should have status=UNPAID."""
        rms = create_standard_household()
        shares = calculate_shares(
            total_amount=1200.00,
            split_rule=SplitRuleType.EQUAL,
            roommates=rms,
            expense_id="exp_wifi",
            payer_id="rm_alex",
        )
        for share in shares:
            if share.roommate_id == "rm_alex":
                self.assertEqual(share.status, SharePaymentStatus.PAID)
            else:
                self.assertEqual(share.status, SharePaymentStatus.UNPAID)
            self.assertEqual(share.expense_id, "exp_wifi")
            self.assertEqual(share.escalation_stage, EscalationStage.STAGE_1_ANNOUNCE)

    def test_empty_and_zero_amount_boundaries(self):
        """Zero amount or empty roommates should return empty list."""
        rms = create_standard_household()
        self.assertEqual(calculate_shares(0.0, SplitRuleType.EQUAL, rms), [])
        self.assertEqual(calculate_shares(-50.0, SplitRuleType.EQUAL, rms), [])
        self.assertEqual(calculate_shares(100.0, SplitRuleType.EQUAL, []), [])


if __name__ == "__main__":
    unittest.main()
