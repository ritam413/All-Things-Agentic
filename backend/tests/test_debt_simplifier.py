"""
Unit Tests for Ticket T-04: Min-Cash-Flow Debt Simplification Algorithm.
Strict TDD tests asserting net balance conservation, minimal transaction bounds,
cycle elimination, and UPI link/QR code attachment.
"""

import sys
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import RawDebt, Roommate, Settlement, DebtSimplificationResult
from backend.app.agent.tools.debt_simplifier import simplify_household_debts


class TestDebtSimplifierTDD(unittest.TestCase):
    """TDD test cases at the simplify_household_debts seam."""

    # --- Vertical Slice 1: Pairwise Direct Debt ---

    def test_pairwise_direct_debt(self):
        """Rahul owes Alex ₹500.00 -> 1 settlement: Rahul pays Alex ₹500.00."""
        debts = [
            RawDebt(debtor_id="rm_rahul", debtor_name="Rahul Verma", creditor_id="rm_alex", creditor_name="Alex Chen", amount=500.00)
        ]
        res = simplify_household_debts(debts)
        self.assertEqual(res.raw_debts_count, 1)
        self.assertEqual(res.simplified_transfers_count, 1)
        self.assertEqual(res.total_volume_cleared, 500.00)
        settlement = res.settlements[0]
        self.assertEqual(settlement.from_roommate_id, "rm_rahul")
        self.assertEqual(settlement.to_roommate_id, "rm_alex")
        self.assertEqual(settlement.amount, 500.00)

    # --- Vertical Slice 2: Circular Cycle Cancellation ---

    def test_circular_cycle_cancellation(self):
        """Alex owes Priya ₹30, Priya owes Rahul ₹30, Rahul owes Alex ₹30 -> 0 settlements."""
        debts = [
            RawDebt(debtor_id="rm_alex", debtor_name="Alex", creditor_id="rm_priya", creditor_name="Priya", amount=30.00),
            RawDebt(debtor_id="rm_priya", debtor_name="Priya", creditor_id="rm_rahul", creditor_name="Rahul", amount=30.00),
            RawDebt(debtor_id="rm_rahul", debtor_name="Rahul", creditor_id="rm_alex", creditor_name="Alex", amount=30.00),
        ]
        res = simplify_household_debts(debts)
        self.assertEqual(res.simplified_transfers_count, 0)
        self.assertEqual(len(res.settlements), 0)
        self.assertEqual(res.total_volume_cleared, 0.0)

    # --- Vertical Slice 3: Transitive Debt Chain Reduction ---

    def test_transitive_debt_chain_reduction(self):
        """
        Samira owes Rahul ₹400.00; Rahul owes Alex ₹400.00.
        Net: Samira -400, Rahul 0, Alex +400.
        Result: 1 settlement (Samira pays Alex ₹400.00 directly).
        """
        debts = [
            RawDebt(debtor_id="rm_sam", debtor_name="Samira", creditor_id="rm_rahul", creditor_name="Rahul", amount=400.00),
            RawDebt(debtor_id="rm_rahul", debtor_name="Rahul", creditor_id="rm_alex", creditor_name="Alex", amount=400.00),
        ]
        res = simplify_household_debts(debts)
        self.assertEqual(res.simplified_transfers_count, 1)
        self.assertEqual(res.total_volume_cleared, 400.00)
        settlement = res.settlements[0]
        self.assertEqual(settlement.from_roommate_id, "rm_sam")
        self.assertEqual(settlement.to_roommate_id, "rm_alex")
        self.assertEqual(settlement.amount, 400.00)

    # --- Vertical Slice 4: Complex Multi-Party Network Bound ---

    def test_complex_multi_party_network_bound_and_balance_conservation(self):
        """
        4 participants (Bob, Charlie, Dave, Alice) with 6 mutual debts totaling ₹180.00.
        Must reduce to <= 3 settlements while strictly conserving net balances.
        """
        debts = [
            RawDebt(debtor_id="rm_bob", debtor_name="Bob", creditor_id="rm_alice", creditor_name="Alice", amount=40.0),
            RawDebt(debtor_id="rm_charlie", debtor_name="Charlie", creditor_id="rm_alice", creditor_name="Alice", amount=60.0),
            RawDebt(debtor_id="rm_dave", debtor_name="Dave", creditor_id="rm_bob", creditor_name="Bob", amount=20.0),
            RawDebt(debtor_id="rm_dave", debtor_name="Dave", creditor_id="rm_charlie", creditor_name="Charlie", amount=30.0),
            RawDebt(debtor_id="rm_alice", debtor_name="Alice", creditor_id="rm_dave", creditor_name="Dave", amount=10.0),
            RawDebt(debtor_id="rm_charlie", debtor_name="Charlie", creditor_id="rm_bob", creditor_name="Bob", amount=10.0),
        ]
        res = simplify_household_debts(debts)
        self.assertLessEqual(res.simplified_transfers_count, 3)
        self.assertLess(res.simplified_transfers_count, len(debts))

        # Check net balance conservation
        # Raw balances:
        # Alice: +40 +60 -10 = +90
        # Bob: -40 +20 +10 = -10 (Wait: debtor 40 to Alice (-40), creditor 20 from Dave (+20), creditor 10 from Charlie (+10) -> -10)
        # Charlie: -60 +30 -10 = -40
        # Dave: -20 -30 +10 = -40
        # Sum = +90 - 10 - 40 - 40 = 0
        net_after = {}
        for s in res.settlements:
            net_after[s.to_roommate_id] = net_after.get(s.to_roommate_id, 0.0) + s.amount
            net_after[s.from_roommate_id] = net_after.get(s.from_roommate_id, 0.0) - s.amount

        self.assertAlmostEqual(net_after.get("rm_alice", 0.0), 90.0)
        self.assertAlmostEqual(net_after.get("rm_bob", 0.0), -10.0)
        self.assertAlmostEqual(net_after.get("rm_charlie", 0.0), -40.0)
        self.assertAlmostEqual(net_after.get("rm_dave", 0.0), -40.0)

    # --- Vertical Slice 5: UPI VPA Lookup & QR Code Generation ---

    def test_upi_vpa_lookup_and_qr_code_generation(self):
        """Roommates map lookups must populate correct UPI VPA and base64 QR code."""
        alex = Roommate(id="rm_alex", name="Alex Chen", email="alex@test.com", phone="1", upi_vpa="alex@okaxis", avg_settlement_hours=2.0)
        rahul = Roommate(id="rm_rahul", name="Rahul Verma", email="rahul@test.com", phone="2", upi_vpa="rahul@ybl", avg_settlement_hours=24.0)
        roommates_map = {"rm_alex": alex, "rm_rahul": rahul}

        debts = [
            RawDebt(debtor_id="rm_rahul", debtor_name="Rahul Verma", creditor_id="rm_alex", creditor_name="Alex Chen", amount=250.00)
        ]
        res = simplify_household_debts(debts, roommates_map=roommates_map)
        self.assertEqual(len(res.settlements), 1)
        s = res.settlements[0]
        self.assertIn("pa=alex@okaxis", s.upi_deep_link)
        self.assertIn("am=250.00", s.upi_deep_link)
        self.assertTrue(s.qr_code_base64.startswith("data:image/png;base64,"))

    # --- Vertical Slice 6: Boundary & Degenerate Cases ---

    def test_boundary_and_degenerate_cases(self):
        """Empty debts, self-debts, and zero-amount debts should be handled safely."""
        self.assertEqual(simplify_household_debts([]).simplified_transfers_count, 0)

        self_debt = [
            RawDebt(debtor_id="rm_alex", debtor_name="Alex", creditor_id="rm_alex", creditor_name="Alex", amount=100.0)
        ]
        self.assertEqual(simplify_household_debts(self_debt).simplified_transfers_count, 0)

        zero_debt = [
            RawDebt(debtor_id="rm_alex", debtor_name="Alex", creditor_id="rm_priya", creditor_name="Priya", amount=0.0)
        ]
        self.assertEqual(simplify_household_debts(zero_debt).simplified_transfers_count, 0)


if __name__ == "__main__":
    unittest.main()
