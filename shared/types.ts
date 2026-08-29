/**
 * Shared TypeScript definitions for RoomieOps AI.
 * Single source of truth corresponding to shared/schema.py.
 */

export const DEFAULT_HOUSEHOLD_ID = 'hh_palm_grove_402';
export const DEFAULT_PAYER_ID = 'rm_alex';

export type SplitRuleType = 'EQUAL' | 'ROOM_AREA' | 'PERCENTAGE' | 'ITEMIZED';

export type ExpenseCategory =
  | 'RENT'
  | 'ELECTRICITY'
  | 'GROCERIES'
  | 'WIFI'
  | 'MAINTENANCE'
  | 'OTHER';

export type EscalationStage =
  | 'STAGE_1_ANNOUNCE'
  | 'STAGE_2_NUDGE'
  | 'STAGE_3_DEADLINE'
  | 'STAGE_4_OVERDUE';

export type SharePaymentStatus = 'UNPAID' | 'PAID';

export type HabitBadge = 'RAPID_SETTLER' | 'RELIABLE' | 'CHRONIC_LATE';

export type ActivityEventType =
  | 'RECEIPT_PARSED'
  | 'SPLIT_CALCULATED'
  | 'PAYMENT_REQUESTED'
  | 'ESCALATION_TRIGGERED'
  | 'PAYMENT_SETTLED'
  | 'DEBTS_SIMPLIFIED'
  | 'AUTONOMOUS_CRON_SCAN';

export interface Roommate {
  id: string;
  name: string;
  email: string;
  phone: string;
  upi_vpa: string;
  room_sq_ft: number;
  custom_split_pct?: number;
  habit_badge?: HabitBadge;
  avg_settlement_hours: number;
}

export interface Household {
  id: string;
  name: string;
  default_currency: string;
  default_split_rule: SplitRuleType;
  roommates: Roommate[];
}

export interface ExpenseItem {
  name: string;
  amount: number;
  category: string;
  assigned_roommate_ids?: string[];
}

export interface ParsedExpense {
  vendor: string;
  category: ExpenseCategory;
  total_amount: number;
  tax_amount: number;
  bill_date: string;
  due_date: string;
  items: ExpenseItem[];
  confidence_score: number;
}

export interface SplitShare {
  id: string;
  expense_id: string;
  roommate_id: string;
  roommate_name: string;
  amount_owed: number;
  status: SharePaymentStatus;
  escalation_stage: EscalationStage;
  last_notified_at?: string;
  paid_at?: string;
  payment_ref?: string;
  upi_deep_link: string;
  qr_code_base64: string;
}

export interface Expense {
  id: string;
  household_id: string;
  payer_id: string;
  payer_name: string;
  vendor: string;
  category: ExpenseCategory;
  total_amount: number;
  tax_amount: number;
  bill_date: string;
  due_date: string;
  split_rule: SplitRuleType;
  items: ExpenseItem[];
  receipt_image_url?: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED';
  shares: SplitShare[];
}

export interface PaymentIntent {
  payee_vpa: string;
  payee_name: string;
  amount: number;
  transaction_note: string;
  deep_link: string;
  qr_code_base64: string;
}

export interface RawDebt {
  debtor_id: string;
  debtor_name: string;
  creditor_id: string;
  creditor_name: string;
  amount: number;
}

export interface Settlement {
  from_roommate_id: string;
  from_roommate_name: string;
  to_roommate_id: string;
  to_roommate_name: string;
  amount: number;
  upi_deep_link: string;
  qr_code_base64: string;
}

export interface ConfirmPaymentResponse {
  status: string;
  split_share?: SplitShare;
  message?: string;
}

export interface ConfirmSettlementRequest {
  household_id: string;
  from_roommate_id: string;
  to_roommate_id: string;
  amount: number;
  payment_ref?: string;
}

export interface DebtSimplificationResult {
  raw_debts_count: number;
  simplified_transfers_count: number;
  total_volume_cleared: number;
  settlements: Settlement[];
}

export interface AgentActivityLog {
  id: string;
  household_id: string;
  timestamp: string;
  event_type: ActivityEventType;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  metadata?: Record<string, any>;
}

export interface HabitProfile {
  roommate_id: string;
  roommate_name: string;
  avg_settlement_hours: number;
  on_time_ratio: number;
  total_bills_settled: number;
  consecutive_late_count: number;
  habit_badge: HabitBadge;
}

// --- User & Auth ---

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  upi_vpa?: string;
  avatar_url?: string | null;
  household_ids: string[];
  created_at?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  upi_vpa?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserProfileUpdateRequest {
  name?: string;
  phone?: string;
  upi_vpa?: string;
  avatar_url?: string | null;
}

// --- Household Management Requests ---

export interface CreateHouseholdRequest {
  name: string;
  default_currency?: string;
  default_split_rule?: SplitRuleType;
  creator_user_id?: string;
}

export interface AddMemberRequest {
  name: string;
  email: string;
  phone?: string;
  upi_vpa: string;
  room_sq_ft?: number;
  custom_split_pct?: number;
}

export interface UpdateMemberRequest {
  name?: string;
  email?: string;
  phone?: string;
  upi_vpa?: string;
  room_sq_ft?: number;
  custom_split_pct?: number;
}

// --- Settlement Status & "Who Has Paid vs Who Is Left" ---

export interface MemberPaymentSummary {
  roommate_id: string;
  roommate_name: string;
  total_owed: number;
  total_paid: number;
  total_pending: number;
  is_cleared: boolean;
  upi_vpa: string;
  pending_shares_count: number;
  highest_escalation_stage?: EscalationStage | null;
}

export interface BillShareStatusSummary {
  expense_id: string;
  vendor: string;
  category: ExpenseCategory;
  total_amount: number;
  due_date: string;
  payer_id: string;
  payer_name: string;
  paid_count: number;
  unpaid_count: number;
  is_fully_settled: boolean;
  shares: SplitShare[];
}

export interface HouseholdSettlementStatus {
  household_id: string;
  total_billed: number;
  total_paid: number;
  total_pending: number;
  cleared_percentage: number;
  paid_members: MemberPaymentSummary[];
  pending_members: MemberPaymentSummary[];
  bills_summary: BillShareStatusSummary[];
}

