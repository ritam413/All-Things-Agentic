"""
FastAPI REST API Routes for RoomieOps AI.
Strictly implements the shared/schema.py contracts.
"""

import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import (
    DEFAULT_HOUSEHOLD_ID,
    DEFAULT_PAYER_ID,
    Household,
    Expense,
    ParsedExpense,
    SplitRuleType,
    ExpenseCategory,
    AgentActivityLog,
    DebtSimplificationResult,
    HabitProfile,
    SplitShare,
    ConfirmPaymentResponse,
    ConfirmSettlementRequest,
)
from backend.app.agent.core import agent
from backend.app.services.firestore_service import storage
from backend.app.agent.tools.receipt_parser import get_mock_parsed_expense

router = APIRouter(prefix="/api")


# --- DTOs ---

class CreateExpenseRequest(BaseModel):
    household_id: str = DEFAULT_HOUSEHOLD_ID
    payer_id: str = DEFAULT_PAYER_ID
    vendor: str
    category: ExpenseCategory
    total_amount: float
    tax_amount: float = 0.0
    due_date: Optional[str] = None
    split_rule: SplitRuleType = SplitRuleType.EQUAL
    items: Optional[List[Any]] = None


class PresetBillRequest(BaseModel):
    household_id: str = DEFAULT_HOUSEHOLD_ID
    preset_type: str  # "electricity", "wifi", "groceries", "rent"
    payer_id: Optional[str] = DEFAULT_PAYER_ID
    split_rule: Optional[SplitRuleType] = SplitRuleType.EQUAL


class ConfirmPaymentRequest(BaseModel):
    split_share_id: str
    payment_ref: Optional[str] = "UPI/DEMO_CONFIRM"


class TimeTravelRequest(BaseModel):
    household_id: str = DEFAULT_HOUSEHOLD_ID
    days_forward: int = 3


# --- Endpoints ---

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "agent": "RoomieOps AI",
        "cloud_run_ready": True,
        "firestore_connected": storage.use_firestore,
    }


@router.get("/households/{household_id}", response_model=Household)
def get_household(household_id: str = DEFAULT_HOUSEHOLD_ID):
    hh = storage.get_household(household_id)
    if not hh:
        raise HTTPException(status_code=404, detail="Household not found")
    return hh


@router.get("/households/{household_id}/analytics", response_model=List[HabitProfile])
def get_analytics(household_id: str = DEFAULT_HOUSEHOLD_ID):
    return storage.get_memory_profiles(household_id)


@router.post("/expenses/parse", response_model=ParsedExpense)
async def parse_expense_receipt(file: UploadFile = File(...)):
    """Uploads an image/PDF bill and invokes Gemini Multimodal Vision."""
    contents = await file.read()
    return agent.parse_uploaded_receipt(
        file_bytes=contents,
        mime_type=file.content_type or "image/jpeg",
        filename=file.filename or "receipt.jpg",
    )


@router.post("/expenses/preset", response_model=Expense)
def ingest_preset_bill(req: PresetBillRequest):
    """One-click preset bill ingestion for hackathon demos."""
    parsed = get_mock_parsed_expense(req.preset_type)
    return agent.create_and_split_expense(
        household_id=req.household_id,
        payer_id=req.payer_id or DEFAULT_PAYER_ID,
        vendor=parsed.vendor,
        category=parsed.category,
        total_amount=parsed.total_amount,
        tax_amount=parsed.tax_amount,
        due_date=parsed.due_date,
        split_rule=req.split_rule or SplitRuleType.EQUAL,
        items=parsed.items,
    )


@router.post("/expenses", response_model=Expense)
def create_expense(req: CreateExpenseRequest):
    """Creates a new expense and calculates split shares."""
    return agent.create_and_split_expense(
        household_id=req.household_id,
        payer_id=req.payer_id,
        vendor=req.vendor,
        category=req.category,
        total_amount=req.total_amount,
        tax_amount=req.tax_amount,
        due_date=req.due_date,
        split_rule=req.split_rule,
        items=req.items,
    )


@router.get("/expenses", response_model=List[Expense])
def list_expenses(household_id: str = DEFAULT_HOUSEHOLD_ID):
    return storage.get_expenses(household_id)


@router.post("/payments/confirm", response_model=ConfirmPaymentResponse)
def confirm_payment(req: ConfirmPaymentRequest):
    """Webhook triggered when a roommate confirms individual split share payment."""
    share = agent.confirm_split_share_payment(
        share_id=req.split_share_id,
        payment_ref=req.payment_ref or "UPI/DIRECT_CONFIRM",
        settled_hours=1.5,
        was_on_time=True,
    )
    if not share:
        raise HTTPException(status_code=404, detail="Split share not found")
    return ConfirmPaymentResponse(status="success", split_share=share, message="Payment successfully confirmed.")


@router.post("/debts/settle")
def settle_debt(req: ConfirmSettlementRequest):
    """Webhook triggered when settling a simplified Min-Cash-Flow debt transfer."""
    return agent.confirm_debt_settlement(
        household_id=req.household_id,
        from_roommate_id=req.from_roommate_id,
        to_roommate_id=req.to_roommate_id,
        amount=req.amount,
        payment_ref=req.payment_ref or "UPI/SETTLEMENT_CONFIRM",
    )


@router.get("/debts/simplify", response_model=DebtSimplificationResult)
def get_simplified_debts(household_id: str = DEFAULT_HOUSEHOLD_ID):
    """Runs the Min-Cash-Flow graph algorithm to compress mutual IOUs."""
    return agent.simplify_debts(household_id)


@router.post("/agent/pulse", response_model=List[AgentActivityLog])
def trigger_agent_pulse(household_id: str = DEFAULT_HOUSEHOLD_ID):
    """Periodic pulse webhook invoked by Google Cloud Scheduler."""
    return agent.run_autonomous_pulse(household_id=household_id, simulated_days_forward=0)


@router.post("/agent/simulate-days", response_model=List[AgentActivityLog])
def simulate_time_travel(req: TimeTravelRequest):
    """Time-travel simulator for live demo video recording."""
    storage.simulated_days_offset += req.days_forward
    return agent.run_autonomous_pulse(
        household_id=req.household_id,
        simulated_days_forward=storage.simulated_days_offset
    )


@router.get("/agent/activity", response_model=List[AgentActivityLog])
def get_agent_activity(household_id: str = DEFAULT_HOUSEHOLD_ID, limit: int = 30):
    return storage.get_activity_logs(household_id=household_id, limit=limit)
