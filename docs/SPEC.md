# Technical Specification: RoomieOps AI

## 1. System Objective & Hackathon Fit
**RoomieOps AI** is an autonomous background ops agent built for the Google **All Things Agentic Hackathon** (**The Taskmaster** track). It completely automates the multi-step cycle of roommate bill ingestion, split mathematics, one-tap payment link dispatch, background due-date tracking, tone-escalated follow-ups, debt simplification, and behavioral memory in Firestore.

---

## 2. Shared Data Models & Contracts (`shared/schema.py` / `shared/types.ts`)

### `Roommate`
```typescript
interface Roommate {
  id: string;
  name: string;
  email: string;
  phone: string;
  upiVpa: string;        // e.g. "rahul@okaxis"
  roomSqFt: number;      // e.g. 250
  habitBadge?: 'RAPID_SETTLER' | 'RELIABLE' | 'CHRONIC_LATE';
  avgSettlementHours: number;
}
```

### `Expense` (Parsed Bill)
```typescript
interface ExpenseItem {
  name: string;
  amount: number;
  category: string;
}

interface Expense {
  id: string;
  householdId: string;
  payerId: string;
  vendor: string;
  category: 'RENT' | 'ELECTRICITY' | 'GROCERIES' | 'WIFI' | 'MAINTENANCE' | 'OTHER';
  totalAmount: number;
  taxAmount: number;
  billDate: string;      // ISO format YYYY-MM-DD
  dueDate: string;       // ISO format YYYY-MM-DD
  splitRule: 'EQUAL' | 'ROOM_AREA' | 'PERCENTAGE' | 'ITEMIZED';
  items: ExpenseItem[];
  receiptImageUrl?: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED';
}
```

### `SplitShare`
```typescript
interface SplitShare {
  id: string;
  expenseId: string;
  roommateId: string;
  amountOwed: number;
  status: 'UNPAID' | 'PAID';
  escalationStage: 'STAGE_1_ANNOUNCE' | 'STAGE_2_NUDGE' | 'STAGE_3_DEADLINE' | 'STAGE_4_OVERDUE';
  lastNotifiedAt?: string;
  paidAt?: string;
  paymentRef?: string;
  upiDeepLink: string;
  qrCodeBase64: string;
}
```

### `Settlement` (Simplified Debt Transfer)
```typescript
interface Settlement {
  fromRoommateId: string;
  fromRoommateName: string;
  toRoommateId: string;
  toRoommateName: string;
  amount: number;
  upiDeepLink: string;
  qrCodeBase64: string;
}
```

### `AgentActivityLog`
```typescript
interface AgentActivityLog {
  id: string;
  householdId: string;
  timestamp: string;
  eventType: 'RECEIPT_PARSED' | 'SPLIT_CALCULATED' | 'PAYMENT_REQUESTED' | 'ESCALATION_TRIGGERED' | 'PAYMENT_SETTLED' | 'DEBTS_SIMPLIFIED' | 'AUTONOMOUS_CRON_SCAN';
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  metadata?: Record<string, any>;
}
```

---

## 3. REST API Contract Endpoints

| Method | Path | Description | Producer / Consumer |
|---|---|---|---|
| `POST` | `/api/expenses/parse` | Multimodal receipt image upload & Gemini extraction | Dev 2 / Dev 3 |
| `POST` | `/api/expenses` | Save expense & auto-generate split shares | Dev 2 / Dev 3 |
| `GET` | `/api/expenses` | List all active household expenses & shares | Dev 2 / Dev 3 |
| `POST` | `/api/payments/confirm` | Confirm payment webhook / reference entry | Dev 2 / Dev 3 |
| `GET` | `/api/debts/simplify` | Run Min-Cash-Flow debt simplification | Dev 2 / Dev 3 |
| `POST` | `/api/agent/pulse` | Autonomous cron trigger (called by Cloud Scheduler) | Dev 2 / Cloud |
| `POST` | `/api/agent/simulate-days` | Fast-forward time for live video demo | Dev 2 / Dev 3 |
| `GET` | `/api/agent/activity` | Stream chronological agent audit activity log | Dev 2 / Dev 3 |
| `GET` | `/api/households/{id}/analytics` | Roommate habit profiles & spend breakdown | Dev 2 / Dev 3 |
