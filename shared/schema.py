"""
Shared Domain Schemas and Pydantic Models for RoomieOps AI.
Single source of truth for Backend, Tools, and API contracts.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# Domain Constants
DEFAULT_HOUSEHOLD_ID = "hh_palm_grove_402"
DEFAULT_PAYER_ID = "rm_alex"


class SplitRuleType(str, Enum):
    EQUAL = "EQUAL"
    ROOM_AREA = "ROOM_AREA"
    PERCENTAGE = "PERCENTAGE"
    ITEMIZED = "ITEMIZED"


class ExpenseCategory(str, Enum):
    RENT = "RENT"
    ELECTRICITY = "ELECTRICITY"
    GROCERIES = "GROCERIES"
    WIFI = "WIFI"
    MAINTENANCE = "MAINTENANCE"
    OTHER = "OTHER"


class EscalationStage(str, Enum):
    STAGE_1_ANNOUNCE = "STAGE_1_ANNOUNCE"
    STAGE_2_NUDGE = "STAGE_2_NUDGE"
    STAGE_3_DEADLINE = "STAGE_3_DEADLINE"
    STAGE_4_OVERDUE = "STAGE_4_OVERDUE"


class SharePaymentStatus(str, Enum):
    UNPAID = "UNPAID"
    PAID = "PAID"


class HabitBadge(str, Enum):
    RAPID_SETTLER = "RAPID_SETTLER"
    RELIABLE = "RELIABLE"
    CHRONIC_LATE = "CHRONIC_LATE"


class ActivityEventType(str, Enum):
    RECEIPT_PARSED = "RECEIPT_PARSED"
    SPLIT_CALCULATED = "SPLIT_CALCULATED"
    PAYMENT_REQUESTED = "PAYMENT_REQUESTED"
    ESCALATION_TRIGGERED = "ESCALATION_TRIGGERED"
    PAYMENT_SETTLED = "PAYMENT_SETTLED"
    DEBTS_SIMPLIFIED = "DEBTS_SIMPLIFIED"
    AUTONOMOUS_CRON_SCAN = "AUTONOMOUS_CRON_SCAN"


# --- Roommate & Household ---

class Roommate(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    upi_vpa: str = Field(description="Payee UPI VPA handle, e.g. alex@okaxis")
    room_sq_ft: float = Field(default=250.0, description="Room area in square feet")
    custom_split_pct: Optional[float] = Field(default=None, description="Custom split % if applicable")
    habit_badge: Optional[HabitBadge] = Field(default=HabitBadge.RELIABLE)
    avg_settlement_hours: float = Field(default=24.0)


class Household(BaseModel):
    id: str
    name: str
    default_currency: str = "INR"
    default_split_rule: SplitRuleType = SplitRuleType.EQUAL
    roommates: List[Roommate]


# --- Ingested Bill / Expense ---

class ExpenseItem(BaseModel):
    name: str
    amount: float
    category: str = "GENERAL"
    assigned_roommate_ids: Optional[List[str]] = Field(default=None, description="Roommates splitting this specific item (for ITEMIZED split)")


class ParsedExpense(BaseModel):
    vendor: str
    category: ExpenseCategory
    total_amount: float
    tax_amount: float = 0.0
    bill_date: str
    due_date: str
    items: List[ExpenseItem] = []
    confidence_score: float = 0.95


class SplitShare(BaseModel):
    id: str
    expense_id: str
    roommate_id: str
    roommate_name: str
    amount_owed: float
    status: SharePaymentStatus = SharePaymentStatus.UNPAID
    escalation_stage: EscalationStage = EscalationStage.STAGE_1_ANNOUNCE
    last_notified_at: Optional[str] = None
    paid_at: Optional[str] = None
    payment_ref: Optional[str] = None
    upi_deep_link: str = ""
    qr_code_base64: str = ""


class Expense(BaseModel):
    id: str
    household_id: str
    payer_id: str
    payer_name: str
    vendor: str
    category: ExpenseCategory
    total_amount: float
    tax_amount: float = 0.0
    bill_date: str
    due_date: str
    split_rule: SplitRuleType
    items: List[ExpenseItem] = []
    receipt_image_url: Optional[str] = None
    status: str = "PENDING"
    shares: List[SplitShare] = []


# --- Payments & Settlements ---

class PaymentIntent(BaseModel):
    payee_vpa: str
    payee_name: str
    amount: float
    transaction_note: str
    deep_link: str
    qr_code_base64: str


class RawDebt(BaseModel):
    debtor_id: str
    debtor_name: str
    creditor_id: str
    creditor_name: str
    amount: float


class Settlement(BaseModel):
    from_roommate_id: str
    from_roommate_name: str
    to_roommate_id: str
    to_roommate_name: str
    amount: float
    upi_deep_link: str = ""
    qr_code_base64: str = ""


class ConfirmPaymentResponse(BaseModel):
    status: str = "success"
    split_share: Optional[SplitShare] = None
    message: Optional[str] = None


class ConfirmSettlementRequest(BaseModel):
    household_id: str = DEFAULT_HOUSEHOLD_ID
    from_roommate_id: str
    to_roommate_id: str
    amount: float
    payment_ref: Optional[str] = "UPI/SETTLEMENT_CONFIRM"


class DebtSimplificationResult(BaseModel):
    raw_debts_count: int
    simplified_transfers_count: int
    total_volume_cleared: float
    settlements: List[Settlement]


# --- Agent Activity & Audit ---

class AgentActivityLog(BaseModel):
    id: str
    household_id: str
    timestamp: str
    event_type: ActivityEventType
    title: str
    description: str
    severity: str = "INFO"  # INFO, WARNING, ALERT, SUCCESS
    metadata: Optional[Dict[str, Any]] = None


class HabitProfile(BaseModel):
    roommate_id: str
    roommate_name: str
    avg_settlement_hours: float
    on_time_ratio: float
    total_bills_settled: int
    consecutive_late_count: int
    habit_badge: HabitBadge
