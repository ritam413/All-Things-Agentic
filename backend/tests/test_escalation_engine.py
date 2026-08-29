"""
TDD Suite for Ticket T-10: 4-Stage Autonomous Tone Escalation Engine (Dev 1).
Verifies:
1. Deterministic 4-stage progression based on due date temporal delta
2. Severity mapping (INFO, WARNING, ALERT)
3. Contextual message formatting including recipient, amount, payee, and UPI deep link
4. Autonomous pulse execution (ignoring paid shares, updating escalation stage, generating immutable logs)
5. Agent pulse integration with simulated forward date travel
"""

import unittest
from datetime import date, timedelta
from typing import List

from shared.schema import (
    DEFAULT_HOUSEHOLD_ID,
    SplitShare,
    EscalationStage,
    SharePaymentStatus,
    ActivityEventType,
    Expense,
    SplitRuleType,
    Roommate,
    Household,
)
from backend.app.agent.tools.escalation_engine import (
    evaluate_escalation_stage,
    format_escalation_message,
    process_autonomous_pulse,
)
from backend.app.services.firestore_service import StorageRepository
from backend.app.agent.core import RoomieOpsAgent


class TestEscalationEngineTDD(unittest.TestCase):

    def setUp(self):
        self.today = date(2026, 8, 29)

    # --- Vertical Slice 1: Temporal Delta to Stage & Severity ---

    def test_evaluate_escalation_stage_4_stages_and_severity(self):
        # Stage 1: > 3 days ahead -> STAGE_1_ANNOUNCE, INFO
        stage1, title1, sev1 = evaluate_escalation_stage("2026-09-05", self.today)
        self.assertEqual(stage1, EscalationStage.STAGE_1_ANNOUNCE)
        self.assertEqual(sev1, "INFO")
        self.assertIn("Announcement", title1)

        # Stage 2: 1 to 3 days ahead -> STAGE_2_NUDGE, INFO
        stage2, title2, sev2 = evaluate_escalation_stage("2026-08-31", self.today)
        self.assertEqual(stage2, EscalationStage.STAGE_2_NUDGE)
        self.assertEqual(sev2, "INFO")
        self.assertIn("Nudge", title2)

        # Stage 3: 0 days (Due Today) -> STAGE_3_DEADLINE, WARNING
        stage3, title3, sev3 = evaluate_escalation_stage("2026-08-29", self.today)
        self.assertEqual(stage3, EscalationStage.STAGE_3_DEADLINE)
        self.assertEqual(sev3, "WARNING")
        self.assertIn("Today", title3)

        # Stage 4: Overdue (< 0 days) -> STAGE_4_OVERDUE, ALERT
        stage4, title4, sev4 = evaluate_escalation_stage("2026-08-25", self.today)
        self.assertEqual(stage4, EscalationStage.STAGE_4_OVERDUE)
        self.assertEqual(sev4, "ALERT")
        self.assertIn("Overdue", title4)

    # --- Vertical Slice 2: Edge Case & Corrupt Date Handling ---

    def test_evaluate_escalation_stage_invalid_date_fallback(self):
        # Corrupt or empty string falls back gracefully to today (STAGE_3_DEADLINE) without crashing
        stage, title, sev = evaluate_escalation_stage("not-a-valid-date", self.today)
        self.assertEqual(stage, EscalationStage.STAGE_3_DEADLINE)
        self.assertEqual(sev, "WARNING")

        stage_empty, _, _ = evaluate_escalation_stage("", self.today)
        self.assertEqual(stage_empty, EscalationStage.STAGE_3_DEADLINE)

    # --- Vertical Slice 3: Contextual Message Formatting ---

    def test_format_escalation_message_with_and_without_payee(self):
        upi = "upi://pay?pa=alex@okaxis&pn=Alex%20Chen&am=750.00&cu=INR"

        # Without payee_name
        msg1 = format_escalation_message(
            roommate_name="Priya",
            vendor="Wifi Fiber",
            amount=750.0,
            stage=EscalationStage.STAGE_1_ANNOUNCE,
            upi_link=upi,
        )
        self.assertIn("Hey Priya!", msg1)
        self.assertIn("Wifi Fiber", msg1)
        self.assertIn("₹750.00", msg1)
        self.assertIn(upi, msg1)

        # With payee_name
        msg2 = format_escalation_message(
            roommate_name="Rahul",
            vendor="Electricity",
            amount=600.0,
            stage=EscalationStage.STAGE_2_NUDGE,
            upi_link=upi,
            payee_name="Alex",
        )
        self.assertIn("Rahul", msg2)
        self.assertIn("Electricity", msg2)
        self.assertIn("Alex", msg2)
        self.assertIn("₹600.00", msg2)
        self.assertIn(upi, msg2)

        # Stage 3 Deadline tone
        msg3 = format_escalation_message(
            roommate_name="Sam",
            vendor="Rent",
            amount=10000.0,
            stage=EscalationStage.STAGE_3_DEADLINE,
            upi_link=upi,
            payee_name="Alex",
        )
        self.assertIn("Action Required", msg3)
        self.assertIn("TODAY", msg3)
        self.assertIn("Sam", msg3)

        # Stage 4 Overdue tone
        msg4 = format_escalation_message(
            roommate_name="Sam",
            vendor="Rent",
            amount=10000.0,
            stage=EscalationStage.STAGE_4_OVERDUE,
            upi_link=upi,
            payee_name="Alex",
        )
        self.assertIn("OVERDUE NOTICE", msg4)
        self.assertIn("Sam", msg4)

    # --- Vertical Slice 4: Pulse Skipping Paid Shares ---

    def test_process_autonomous_pulse_skips_paid_shares(self):
        paid_share = SplitShare(
            id="sh_paid_1",
            expense_id="exp_1",
            roommate_id="rm_alex",
            roommate_name="Alex",
            amount_owed=500.0,
            status=SharePaymentStatus.PAID,
            upi_deep_link="upi://pay?pa=alex@okaxis",
        )

        unpaid_items = [
            {
                "share": paid_share,
                "vendor": "Grocery",
                "due_date": "2026-08-20", # Overdue but paid
                "payee_name": "Priya",
            }
        ]

        updated, logs = process_autonomous_pulse(
            household_id=DEFAULT_HOUSEHOLD_ID,
            unpaid_shares=unpaid_items,
            simulated_date=self.today,
        )

        # Paid share should produce 0 notifications and 0 updates
        self.assertEqual(len(updated), 0)
        self.assertEqual(len(logs), 0)

    # --- Vertical Slice 5: Pulse Generates Immutable Logs & Updates State ---

    def test_process_autonomous_pulse_generates_activity_logs_and_updates_shares(self):
        unpaid_share = SplitShare(
            id="sh_unpaid_1",
            expense_id="exp_1",
            roommate_id="rm_rahul",
            roommate_name="Rahul",
            amount_owed=450.50,
            status=SharePaymentStatus.UNPAID,
            upi_deep_link="upi://pay?pa=alex@okaxis&am=450.50",
        )

        unpaid_items = [
            {
                "share": unpaid_share,
                "vendor": "Water Tanker",
                "due_date": "2026-08-25", # 4 days overdue
                "payee_name": "Alex",
            }
        ]

        updated, logs = process_autonomous_pulse(
            household_id=DEFAULT_HOUSEHOLD_ID,
            unpaid_shares=unpaid_items,
            simulated_date=self.today,
        )

        self.assertEqual(len(updated), 1)
        self.assertEqual(len(logs), 1)

        # Verify share state updated
        self.assertEqual(unpaid_share.escalation_stage, EscalationStage.STAGE_4_OVERDUE)
        self.assertIsNotNone(unpaid_share.last_notified_at)

        # Verify activity log format
        log = logs[0]
        self.assertEqual(log.event_type, ActivityEventType.ESCALATION_TRIGGERED)
        self.assertEqual(log.severity, "ALERT")
        self.assertIn("Rahul", log.title)
        self.assertIn("OVERDUE", log.description)
        self.assertEqual(log.metadata["stage"], EscalationStage.STAGE_4_OVERDUE.value)
        self.assertEqual(log.metadata["amount"], 450.50)

    # --- Vertical Slice 6: Agent Orchestrator Time Travel Integration ---

    def test_agent_run_autonomous_pulse_time_travel_integration(self):
        storage = StorageRepository()
        test_agent = RoomieOpsAgent(storage_repo=storage)

        # Seed household
        hh = Household(
            id=DEFAULT_HOUSEHOLD_ID,
            name="Palm Grove 402",
            roommates=[
                Roommate(id="rm_alex", name="Alex", email="a@t.com", phone="1", upi_vpa="alex@upi", room_sq_ft=300, custom_split_pct=50),
                Roommate(id="rm_priya", name="Priya", email="p@t.com", phone="2", upi_vpa="priya@upi", room_sq_ft=300, custom_split_pct=50),
            ]
        )
        storage.save_household(hh)

        # Create expense due on 2026-09-01 (3 days from now)
        exp = test_agent.create_and_split_expense(
            household_id=DEFAULT_HOUSEHOLD_ID,
            payer_id="rm_alex",
            vendor="Broadband",
            total_amount=1000.0,
            due_date="2026-09-01",
            split_rule=SplitRuleType.EQUAL,
        )

        # 1. Run pulse on day 0 -> Priya's share is Stage 2 (3 days ahead)
        logs_d0 = test_agent.run_autonomous_pulse(household_id=DEFAULT_HOUSEHOLD_ID, simulated_days_forward=0)
        priya_logs = [l for l in logs_d0 if "Priya" in l.title]
        self.assertEqual(len(priya_logs), 1)
        self.assertEqual(priya_logs[0].severity, "INFO")

        # 2. Time-travel +10 days forward -> Priya's share is now Overdue (Stage 4)
        logs_d10 = test_agent.run_autonomous_pulse(household_id=DEFAULT_HOUSEHOLD_ID, simulated_days_forward=10)
        priya_overdue = [l for l in logs_d10 if "Priya" in l.title]
        self.assertEqual(len(priya_overdue), 1)
        self.assertEqual(priya_overdue[0].severity, "ALERT")
        self.assertIn("OVERDUE", priya_overdue[0].description)


if __name__ == "__main__":
    unittest.main()
