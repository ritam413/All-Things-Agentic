"""
Escalation Engine Deep Module: 4-Stage Adaptive Tone Escalator.
Evaluates due dates against unpaid split shares and generates tone-adjusted nudges.
Invariants:
- Deterministic tone progression based on temporal delta
- Paid shares produce 0 escalations
"""

import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, date

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import (
    SplitShare,
    EscalationStage,
    SharePaymentStatus,
    AgentActivityLog,
    ActivityEventType,
)


def evaluate_escalation_stage(
    due_date_str: str,
    current_date: date,
) -> Tuple[EscalationStage, str, str]:
    """
    Computes the escalation stage, message tone, and alert severity.
    """
    try:
        due_date = date.fromisoformat(due_date_str)
    except Exception:
        due_date = current_date

    delta_days = (due_date - current_date).days

    if delta_days > 3:
        return (
            EscalationStage.STAGE_1_ANNOUNCE,
            "Friendly Announcement",
            "INFO"
        )
    elif 0 < delta_days <= 3:
        return (
            EscalationStage.STAGE_2_NUDGE,
            f"Gentle Nudge: Due in {delta_days} day(s)",
            "INFO"
        )
    elif delta_days == 0:
        return (
            EscalationStage.STAGE_3_DEADLINE,
            "Firm Reminder: Due Today!",
            "WARNING"
        )
    else:
        overdue_days = abs(delta_days)
        return (
            EscalationStage.STAGE_4_OVERDUE,
            f"URGENT ESCALATION: {overdue_days} day(s) Overdue",
            "ALERT"
        )


def format_escalation_message(
    roommate_name: str,
    vendor: str,
    amount: float,
    stage: EscalationStage,
    upi_link: str,
    payee_name: Optional[str] = None
) -> str:
    """Generates the adaptive tone message text with optional payee context."""
    paid_by = f" (paid by {payee_name})" if payee_name else ""
    if stage == EscalationStage.STAGE_1_ANNOUNCE:
        return f"Hey {roommate_name}! 📄 A new {vendor} bill was split{paid_by}. Your share is ₹{amount:.2f}. Tap to pay: {upi_link}"
    elif stage == EscalationStage.STAGE_2_NUDGE:
        return f"Hi {roommate_name} 😊 Quick friendly reminder: your share of ₹{amount:.2f} for {vendor}{paid_by} is coming due in a few days. Pay here: {upi_link}"
    elif stage == EscalationStage.STAGE_3_DEADLINE:
        return f"⚠️ Action Required, {roommate_name}: Your share of ₹{amount:.2f} for {vendor}{paid_by} is due TODAY. Please settle now: {upi_link}"
    else:
        return f"🚨 OVERDUE NOTICE: {roommate_name}, your share of ₹{amount:.2f} for {vendor}{paid_by} is past due. Notice logged to household feed. Tap to settle immediately: {upi_link}"


def process_autonomous_pulse(
    household_id: str,
    unpaid_shares: List[Dict[str, Any]],
    simulated_date: Optional[date] = None,
) -> Tuple[List[Dict[str, Any]], List[AgentActivityLog]]:
    """
    Main autonomous pulse loop invoked by Cloud Scheduler or Time-Travel Simulator.
    """
    now = simulated_date or date.today()
    timestamp_str = datetime.now().isoformat()

    updated_shares = []
    generated_logs: List[AgentActivityLog] = []

    for item in unpaid_shares:
        share: SplitShare = item["share"]
        vendor: str = item.get("vendor", "Household Bill")
        due_date: str = item.get("due_date", now.isoformat())
        payee_name: Optional[str] = item.get("payee_name")

        if share.status == SharePaymentStatus.PAID:
            continue

        new_stage, summary_title, severity = evaluate_escalation_stage(due_date, now)
        
        # Check if stage advanced or if notification needed
        message = format_escalation_message(
            roommate_name=share.roommate_name,
            vendor=vendor,
            amount=share.amount_owed,
            stage=new_stage,
            upi_link=share.upi_deep_link,
            payee_name=payee_name,
        )

        share.escalation_stage = new_stage
        share.last_notified_at = timestamp_str

        log_entry = AgentActivityLog(
            id=f"log_esc_{share.id}_{now.isoformat()}",
            household_id=household_id,
            timestamp=timestamp_str,
            event_type=ActivityEventType.ESCALATION_TRIGGERED,
            title=f"Autonomous Escalation: {share.roommate_name}",
            description=message,
            severity=severity,
            metadata={
                "share_id": share.id,
                "roommate_id": share.roommate_id,
                "stage": new_stage.value,
                "amount": share.amount_owed,
            }
        )
        generated_logs.append(log_entry)
        updated_shares.append({"share": share, "message": message, "stage": new_stage})

    return updated_shares, generated_logs
