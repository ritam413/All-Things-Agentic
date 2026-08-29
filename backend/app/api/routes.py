"""
FastAPI REST API Routes for RoomieOps AI.
Strictly implements the shared/schema.py contracts.
"""

import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Header
from pydantic import BaseModel

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import (
    DEFAULT_HOUSEHOLD_ID,
    DEFAULT_PAYER_ID,
    Household,
    Roommate,
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
    User,
    AuthToken,
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileUpdateRequest,
    CreateHouseholdRequest,
    AddMemberRequest,
    UpdateMemberRequest,
    HouseholdSettlementStatus,
)
from backend.app.agent.core import agent
from backend.app.services.firestore_service import storage
from backend.app.services.auth_service import auth_service
from backend.app.agent.tools.receipt_parser import get_mock_parsed_expense

router = APIRouter(prefix="/api")


# --- Auth Dependency Helper ---

def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    token = authorization.replace("Bearer ", "").strip()
    user = auth_service.get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")
    return user



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


# --- Auth Endpoints ---

@router.get("/auth/personas", response_model=List[User])
def get_demo_personas():
    """Returns pre-configured demo personas (Alex, Priya, Rahul, Samira) for instant switching."""
    return auth_service.get_demo_personas()


@router.post("/auth/switch-persona/{persona_id}", response_model=AuthToken)
def switch_demo_persona(persona_id: str):
    """Fast one-tap persona switch for zero-friction hackathon demos."""
    try:
        return auth_service.switch_persona(persona_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/auth/register", response_model=AuthToken)
def register_user(req: UserRegisterRequest):
    """Registers a new user and issues a bearer session token."""
    try:
        return auth_service.register_user(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auth/login", response_model=AuthToken)
def login_user(req: UserLoginRequest):
    """Authenticates a user and returns a bearer session token."""
    try:
        return auth_service.login_user(req)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/auth/me", response_model=User)
def get_current_user_profile(authorization: Optional[str] = Header(None)):
    """Fetches the authenticated user profile."""
    return get_current_user_from_header(authorization)


@router.patch("/auth/profile", response_model=User)
def update_user_profile(req: UserProfileUpdateRequest, authorization: Optional[str] = Header(None)):
    """Updates user profile attributes (name, phone, UPI VPA, avatar)."""
    user = get_current_user_from_header(authorization)
    try:
        return auth_service.update_profile(user.id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Endpoints ---

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "agent": "RoomieOps AI",
        "cloud_run_ready": True,
        "firestore_connected": storage.use_firestore,
    }



# --- Household & Member Management Endpoints ---

@router.get("/households", response_model=List[Household])
def list_households(
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    """Lists households, optionally filtered by user ID or authenticated bearer session."""
    target_user_id = user_id
    if not target_user_id and authorization:
        try:
            current_user = get_current_user_from_header(authorization)
            target_user_id = current_user.id
        except HTTPException:
            pass
    return storage.list_households(user_id=target_user_id)


@router.post("/households", response_model=Household, status_code=201)
def create_household(
    req: CreateHouseholdRequest,
    authorization: Optional[str] = Header(None)
):
    """Creates a new household/group and associates the creator user."""
    creator_id = req.creator_user_id
    if not creator_id and authorization:
        try:
            current_user = get_current_user_from_header(authorization)
            creator_id = current_user.id
        except HTTPException:
            pass

    return storage.create_household(
        name=req.name,
        default_currency=req.default_currency,
        default_split_rule=req.default_split_rule,
        creator_user_id=creator_id,
    )


@router.get("/households/{household_id}", response_model=Household)
def get_household(household_id: str = DEFAULT_HOUSEHOLD_ID):
    hh = storage.get_household(household_id)
    if not hh:
        raise HTTPException(status_code=404, detail=f"Household '{household_id}' not found.")
    return hh


@router.post("/households/{household_id}/members", response_model=Roommate, status_code=201)
def add_member_to_household(household_id: str, req: AddMemberRequest):
    """Adds a new roommate/member to the household with room square footage and UPI VPA."""
    try:
        return storage.add_member_to_household(
            household_id=household_id,
            name=req.name,
            email=req.email,
            phone=req.phone,
            upi_vpa=req.upi_vpa,
            room_sq_ft=req.room_sq_ft,
            custom_split_pct=req.custom_split_pct,
        )
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/households/{household_id}/members/{roommate_id}", response_model=Roommate)
def update_household_member(household_id: str, roommate_id: str, req: UpdateMemberRequest):
    """Updates member details (square footage, UPI handle, custom split %)."""
    try:
        return storage.update_member_in_household(
            household_id=household_id,
            roommate_id=roommate_id,
            name=req.name,
            email=req.email,
            phone=req.phone,
            upi_vpa=req.upi_vpa,
            room_sq_ft=req.room_sq_ft,
            custom_split_pct=req.custom_split_pct,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/households/{household_id}/members/{roommate_id}")
def remove_household_member(household_id: str, roommate_id: str):
    """Removes a roommate/person from the household."""
    try:
        storage.remove_member_from_household(household_id=household_id, roommate_id=roommate_id)
        return {
            "status": "success",
            "message": f"Roommate '{roommate_id}' successfully removed from household '{household_id}'."
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/households/{household_id}/analytics", response_model=List[HabitProfile])
def get_analytics(household_id: str = DEFAULT_HOUSEHOLD_ID):
    return storage.get_memory_profiles(household_id)


@router.get("/households/{household_id}/settlement-status", response_model=HouseholdSettlementStatus)
def get_household_settlement_status(household_id: str = DEFAULT_HOUSEHOLD_ID):
    """
    Computes real-time settlement matrix: who has paid, who is left to pay,
    total paid vs pending volumes, and escalation urgency stages.
    """
    try:
        return agent.get_household_settlement_status(household_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


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
