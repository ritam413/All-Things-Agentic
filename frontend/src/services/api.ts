/**
 * Typed Frontend API Client for RoomieOps AI.
 * Consumes shared/types.ts interfaces.
 */

import {
  DEFAULT_HOUSEHOLD_ID,
  Household,
  Roommate,
  Expense,
  ParsedExpense,
  DebtSimplificationResult,
  AgentActivityLog,
  HabitProfile,
  SplitRuleType,
  ConfirmPaymentResponse,
  ConfirmSettlementRequest,
  CreateHouseholdRequest,
  AddMemberRequest,
  UpdateMemberRequest,
  User,
  AuthToken,
  UserRegisterRequest,
  UserLoginRequest,
  UserProfileUpdateRequest,
  HouseholdSettlementStatus,
} from '../../../shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchHouseholds(userId?: string, token?: string): Promise<Household[]> {
  const url = userId
    ? `${API_BASE_URL}/api/households?user_id=${encodeURIComponent(userId)}`
    : `${API_BASE_URL}/api/households`;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch households');
  return res.json();
}

export async function createHousehold(req: CreateHouseholdRequest, token?: string): Promise<Household> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/households`, {
    method: 'POST',
    headers,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Failed to create household');
  return res.json();
}

export async function addHouseholdMember(householdId: string, req: AddMemberRequest): Promise<Roommate> {
  const res = await fetch(`${API_BASE_URL}/api/households/${householdId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Failed to add member to household');
  return res.json();
}

export async function updateHouseholdMember(
  householdId: string,
  roommateId: string,
  req: UpdateMemberRequest
): Promise<Roommate> {
  const res = await fetch(`${API_BASE_URL}/api/households/${householdId}/members/${roommateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Failed to update household member');
  return res.json();
}

export async function removeHouseholdMember(householdId: string, roommateId: string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/households/${householdId}/members/${roommateId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove member from household');
  return res.json();
}

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

export async function fetchSettlementStatus(householdId = DEFAULT_HOUSEHOLD_ID): Promise<HouseholdSettlementStatus> {
  const res = await fetch(`${API_BASE_URL}/api/households/${householdId}/settlement-status`);
  if (!res.ok) throw new Error('Failed to fetch household settlement status');
  return res.json();
}

// --- Auth & User Profile API ---

export async function fetchDemoPersonas(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/api/auth/personas`);
  if (!res.ok) throw new Error('Failed to fetch demo personas');
  return res.json();
}

export async function switchDemoPersona(personaId: string): Promise<AuthToken> {
  const res = await fetch(`${API_BASE_URL}/api/auth/switch-persona/${encodeURIComponent(personaId)}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to switch persona' }));
    throw new Error(err.detail || 'Failed to switch persona');
  }
  return res.json();
}

export async function registerUser(req: UserRegisterRequest): Promise<AuthToken> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function loginUser(req: UserLoginRequest): Promise<AuthToken> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid email or password' }));
    throw new Error(err.detail || 'Invalid email or password');
  }
  return res.json();
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

export async function updateUserProfile(req: UserProfileUpdateRequest, token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update profile' }));
    throw new Error(err.detail || 'Failed to update profile');
  }
  return res.json();
}

