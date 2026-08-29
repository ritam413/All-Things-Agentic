"""
RoomieOps Agent Core Orchestrator.
Combines Gemini Multimodal Ingestion, Split Calculation, Payment Links,
Autonomous Tone Escalation, and Min-Cash-Flow Debt Simplification.
"""

import sys
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, date, timedelta

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import (
    DEFAULT_HOUSEHOLD_ID,
    DEFAULT_PAYER_ID,
    Household,
    Expense,
    SplitShare,
    ParsedExpense,
    SplitRuleType,
    AgentActivityLog,
    ActivityEventType,
    DebtSimplificationResult,
    RawDebt,
    PaymentIntent,
    SharePaymentStatus,
)
from backend.app.agent.tools.receipt_parser import parse_receipt
from backend.app.agent.tools.split_calculator import calculate_shares
from backend.app.agent.tools.payment_links import create_payment_intent, generate_upi_deep_link, generate_qr_base64
from backend.app.agent.tools.debt_simplifier import simplify_household_debts
from backend.app.agent.tools.escalation_engine import process_autonomous_pulse
from backend.app.agent.tools.memory_bank import update_habit_profile
from backend.app.services.firestore_service import storage


class RoomieOpsAgent:
    def __init__(self, storage_repo=storage):
        self.storage = storage_repo

    def parse_uploaded_receipt(
        self,
        file_bytes: bytes,
        mime_type: str = "image/jpeg",
        filename: str = ""
    ) -> ParsedExpense:
        """Invokes Gemini Multimodal Vision to extract bill details."""
        return parse_receipt(file_bytes=file_bytes, mime_type=mime_type, filename=filename)

    def create_and_split_expense(
        self,
        household_id: str = DEFAULT_HOUSEHOLD_ID,
        payer_id: str = DEFAULT_PAYER_ID,
        vendor: str = "Household Expense",
        category: str = "OTHER",
        total_amount: float = 0.0,
        tax_amount: float = 0.0,
        due_date: Optional[str] = None,
        split_rule: SplitRuleType = SplitRuleType.EQUAL,
        items: Optional[List[Any]] = None,
    ) -> Expense:
        """
        Creates an expense, calculates exact shares, generates UPI links,
        and logs the announcement.
        """
        hh = self.storage.get_household(household_id)
        if not hh:
            raise ValueError(f"Household {household_id} not found")

        expense_id = f"exp_{uuid.uuid4().hex[:8]}"
        today_str = date.today().isoformat()
        due_str = due_date or (date.today() + timedelta(days=7)).isoformat()

        payer = next((rm for rm in hh.roommates if rm.id == payer_id), hh.roommates[0])

        # 1. Calculate Split Shares
        shares = calculate_shares(
            total_amount=total_amount,
            split_rule=split_rule,
            roommates=hh.roommates,
            expense_id=expense_id,
            payer_id=payer.id,
            items=items,
        )

        # 2. Attach UPI Deep Links & QR Codes to each share
        for share in shares:
            upi_link = generate_upi_deep_link(
                payee_vpa=payer.upi_vpa,
                payee_name=payer.name,
                amount=share.amount_owed,
                transaction_note=f"{vendor} Split - {share.roommate_name}",
            )
            qr_base64 = generate_qr_base64(upi_link)
            share.upi_deep_link = upi_link
            share.qr_code_base64 = qr_base64

        expense = Expense(
            id=expense_id,
            household_id=household_id,
            payer_id=payer.id,
            payer_name=payer.name,
            vendor=vendor,
            category=category,
            total_amount=total_amount,
            tax_amount=tax_amount,
            bill_date=today_str,
            due_date=due_str,
            split_rule=split_rule,
            items=items or [],
            status="PENDING",
            shares=shares,
        )

        self.storage.save_expense(expense)

        # 3. Log Autonomous Announcement in Activity Stream
        self.storage.add_activity_log(
            AgentActivityLog(
                id=f"log_split_{expense.id}",
                household_id=household_id,
                timestamp=datetime.now().isoformat(),
                event_type=ActivityEventType.SPLIT_CALCULATED,
                title=f"New Bill Parsed & Split: {vendor}",
                description=f"Total: ₹{total_amount:.2f} split among {len(shares)} roommates using {split_rule.value} rule. Stage 1 friendly notices dispatched.",
                severity="INFO",
                metadata={"expense_id": expense.id, "total_amount": total_amount}
            )
        )

        return expense

    def confirm_split_share_payment(
        self,
        share_id: str,
        payment_ref: str = "UPI/DIRECT_CONFIRM",
        settled_hours: float = 1.5,
        was_on_time: bool = True
    ) -> Optional[SplitShare]:
        """
        Domain seam: marks share as paid, updates long-term habit profile,
        and logs audit activity.
        """
        share = self.storage.update_split_share_payment(share_id=share_id, payment_ref=payment_ref)
        if not share:
            return None

        # Update habit profile
        profile = self.storage.get_habit_profile(share.roommate_id)
        if profile:
            updated_profile = update_habit_profile(
                current_profile=profile,
                settled_hours=settled_hours,
                was_on_time=was_on_time
            )
            self.storage.save_habit_profile(updated_profile)

        # Log confirmation
        self.storage.add_activity_log(
            AgentActivityLog(
                id=f"log_pay_{share.id}_{uuid.uuid4().hex[:4]}",
                household_id=DEFAULT_HOUSEHOLD_ID,
                timestamp=datetime.now().isoformat(),
                event_type=ActivityEventType.PAYMENT_SETTLED,
                title=f"Payment Confirmed: {share.roommate_name}",
                description=f"Received ₹{share.amount_owed:.2f} via {payment_ref}. Status updated to PAID.",
                severity="SUCCESS",
                metadata={"share_id": share.id, "roommate_id": share.roommate_id, "amount": share.amount_owed}
            )
        )
        return share

    def confirm_debt_settlement(
        self,
        household_id: str = DEFAULT_HOUSEHOLD_ID,
        from_roommate_id: str = "",
        to_roommate_id: str = "",
        amount: float = 0.0,
        payment_ref: str = "UPI/SETTLEMENT_CONFIRM"
    ) -> Dict[str, Any]:
        """
        Resolves a simplified Min-Cash-Flow graph settlement transfer.
        Updates unpaid shares between the pair, updates memory habit bank, and logs the settlement.
        """
        hh = self.storage.get_household(household_id)
        if not hh:
            raise ValueError(f"Household {household_id} not found")

        rm_map = {rm.id: rm for rm in hh.roommates}
        from_rm = rm_map.get(from_roommate_id)
        to_rm = rm_map.get(to_roommate_id)

        from_name = from_rm.name if from_rm else from_roommate_id
        to_name = to_rm.name if to_rm else to_roommate_id

        # Mark corresponding unpaid split shares from debtor to creditor as paid up to the amount
        remaining_to_clear = amount
        cleared_shares = []

        for exp in self.storage.get_expenses(household_id):
            if exp.payer_id == to_roommate_id:
                for share in exp.shares:
                    if share.roommate_id == from_roommate_id and share.status == SharePaymentStatus.UNPAID:
                        if remaining_to_clear >= share.amount_owed:
                            share.status = SharePaymentStatus.PAID
                            share.paid_at = datetime.now().isoformat()
                            share.payment_ref = payment_ref
                            remaining_to_clear -= share.amount_owed
                            cleared_shares.append(share.id)
                        else:
                            # Partially settled
                            share.amount_owed = round(share.amount_owed - remaining_to_clear, 2)
                            remaining_to_clear = 0.0

                        if all(s.status == SharePaymentStatus.PAID for s in exp.shares):
                            exp.status = "SETTLED"
                        self.storage.save_expense(exp)

                        if remaining_to_clear <= 0:
                            break

        # Update habit profile for paying roommate
        if from_roommate_id:
            profile = self.storage.get_habit_profile(from_roommate_id)
            if profile:
                updated_profile = update_habit_profile(
                    current_profile=profile,
                    settled_hours=2.0,
                    was_on_time=True
                )
                self.storage.save_habit_profile(updated_profile)

        # Log settlement in activity stream
        log_entry = AgentActivityLog(
            id=f"log_settle_{uuid.uuid4().hex[:6]}",
            household_id=household_id,
            timestamp=datetime.now().isoformat(),
            event_type=ActivityEventType.PAYMENT_SETTLED,
            title=f"Debt Settlement Resolved: {from_name} ➔ {to_name}",
            description=f"Transferred ₹{amount:.2f} via {payment_ref}. Graph debt simplified and cleared.",
            severity="SUCCESS",
            metadata={
                "from_roommate_id": from_roommate_id,
                "to_roommate_id": to_roommate_id,
                "amount": amount,
                "cleared_shares": cleared_shares,
            }
        )
        self.storage.add_activity_log(log_entry)

        return {
            "status": "success",
            "message": f"Settlement of ₹{amount:.2f} from {from_name} to {to_name} confirmed.",
            "cleared_shares_count": len(cleared_shares),
            "activity_log": log_entry
        }

    def run_autonomous_pulse(
        self,
        household_id: str = DEFAULT_HOUSEHOLD_ID,
        simulated_days_forward: int = 0
    ) -> List[AgentActivityLog]:
        """
        Executes the unattended background due-date monitor.
        Invoked periodically by Cloud Scheduler or by the Time-Travel Simulator.
        """
        hh = self.storage.get_household(household_id)
        if not hh:
            return []

        ref_date = date.today() + timedelta(days=simulated_days_forward)

        # Collect all unpaid split shares across all active expenses
        unpaid_items = []
        for exp in self.storage.get_expenses(household_id):
            if exp.status != "SETTLED":
                for share in exp.shares:
                    if share.status == SharePaymentStatus.UNPAID:
                        unpaid_items.append({
                            "share": share,
                            "vendor": exp.vendor,
                            "due_date": exp.due_date,
                            "payee_name": exp.payer_name,
                        })

        if not unpaid_items:
            log = AgentActivityLog(
                id=f"log_pulse_{uuid.uuid4().hex[:6]}",
                household_id=household_id,
                timestamp=datetime.now().isoformat(),
                event_type=ActivityEventType.AUTONOMOUS_CRON_SCAN,
                title="Autonomous Scan: All Clear",
                description=f"Periodic background pulse executed for date {ref_date.isoformat()}. Zero unpaid overdue balances found.",
                severity="SUCCESS",
            )
            self.storage.add_activity_log(log)
            return [log]

        updated, logs = process_autonomous_pulse(
            household_id=household_id,
            unpaid_shares=unpaid_items,
            simulated_date=ref_date,
        )

        for log in logs:
            self.storage.add_activity_log(log)

        return logs

    def simplify_debts(self, household_id: str = DEFAULT_HOUSEHOLD_ID) -> DebtSimplificationResult:
        """
        Gathers all raw unpaid split shares in the household and computes
        the minimal settlement transfers.
        """
        hh = self.storage.get_household(household_id)
        if not hh:
            raise ValueError(f"Household {household_id} not found")

        rm_map = {rm.id: rm for rm in hh.roommates}
        raw_debts: List[RawDebt] = []

        for exp in self.storage.get_expenses(household_id):
            for share in exp.shares:
                if share.status == SharePaymentStatus.UNPAID and share.roommate_id != exp.payer_id:
                    debtor = rm_map.get(share.roommate_id)
                    creditor = rm_map.get(exp.payer_id)
                    if debtor and creditor:
                        raw_debts.append(
                            RawDebt(
                                debtor_id=debtor.id,
                                debtor_name=debtor.name,
                                creditor_id=creditor.id,
                                creditor_name=creditor.name,
                                amount=share.amount_owed,
                            )
                        )

        result = simplify_household_debts(raw_debts, roommates_map=rm_map)

        self.storage.add_activity_log(
            AgentActivityLog(
                id=f"log_simplify_{uuid.uuid4().hex[:6]}",
                household_id=household_id,
                timestamp=datetime.now().isoformat(),
                event_type=ActivityEventType.DEBTS_SIMPLIFIED,
                title="Debt Simplification Computed",
                description=f"Compressed {result.raw_debts_count} raw IOUs down to {result.simplified_transfers_count} optimal settlements. Total cleared: ₹{result.total_volume_cleared:.2f}.",
                severity="SUCCESS",
                metadata={"raw_count": result.raw_debts_count, "simplified_count": result.simplified_transfers_count}
            )
        )

        return result


# Global Singleton Agent Instance
agent = RoomieOpsAgent()
