/**
 * Typed Frontend API Client for RoomieOps AI.
 * Consumes shared/types.ts interfaces.
 */

import {
  DEFAULT_HOUSEHOLD_ID,
  Household,
  Expense,
  ParsedExpense,
  DebtSimplificationResult,
  AgentActivityLog,
  HabitProfile,
  SplitRuleType,
  ConfirmPaymentResponse,
  ConfirmSettlementRequest,
} from '../../../shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchHousehold(householdId = DEFAULT_HOUSEHOLD_ID): Promise<Household> {
  const res = await fetch(`${API_BASE_URL}/api/households/${householdId}`);
  if (!res.ok) throw new Error('Failed to fetch household');
  return res.json();
}

export async function fetchExpenses(householdId = DEFAULT_HOUSEHOLD_ID): Promise<Expense[]> {
  const res = await fetch(`${API_BASE_URL}/api/expenses?household_id=${householdId}`);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function parseReceiptFile(file: File): Promise<ParsedExpense> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/expenses/parse`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to parse receipt');
  return res.json();
}

export async function ingestPresetBill(presetType: string, splitRule: SplitRuleType = 'EQUAL'): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/api/expenses/preset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preset_type: presetType,
      household_id: DEFAULT_HOUSEHOLD_ID,
      split_rule: splitRule,
    }),
  });
  if (!res.ok) throw new Error('Failed to ingest preset bill');
  return res.json();
}

export async function createExpense(data: {
  household_id: string;
  payer_id: string;
  vendor: string;
  category: string;
  total_amount: number;
  tax_amount?: number;
  due_date?: string;
  split_rule: SplitRuleType;
}): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function confirmPayment(splitShareId: string, paymentRef = 'UPI/CONFIRMED'): Promise<ConfirmPaymentResponse> {
  const res = await fetch(`${API_BASE_URL}/api/payments/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      split_share_id: splitShareId,
      payment_ref: paymentRef,
    }),
  });
  if (!res.ok) throw new Error('Failed to confirm payment');
  return res.json();
}

export async function confirmDebtSettlement(req: ConfirmSettlementRequest): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/debts/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Failed to confirm debt settlement');
  return res.json();
}

export async function fetchSimplifiedDebts(householdId = DEFAULT_HOUSEHOLD_ID): Promise<DebtSimplificationResult> {
  const res = await fetch(`${API_BASE_URL}/api/debts/simplify?household_id=${householdId}`);
  if (!res.ok) throw new Error('Failed to calculate debt simplification');
  return res.json();
}

export async function simulateTimeTravel(daysForward: number, householdId = DEFAULT_HOUSEHOLD_ID): Promise<AgentActivityLog[]> {
  const res = await fetch(`${API_BASE_URL}/api/agent/simulate-days`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      days_forward: daysForward,
      household_id: householdId,
    }),
  });
  if (!res.ok) throw new Error('Failed to simulate time travel');
  return res.json();
}

export async function fetchActivityLogs(householdId = DEFAULT_HOUSEHOLD_ID): Promise<AgentActivityLog[]> {
  const res = await fetch(`${API_BASE_URL}/api/agent/activity?household_id=${householdId}`);
  if (!res.ok) throw new Error('Failed to fetch activity logs');
  return res.json();
}

export async function fetchAnalytics(householdId = DEFAULT_HOUSEHOLD_ID): Promise<HabitProfile[]> {
  const res = await fetch(`${API_BASE_URL}/api/households/${householdId}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}
