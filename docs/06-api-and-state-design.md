# 06 - API & State Design Specification

## 1. REST API Endpoints Specification

All endpoints are prefixed with `/api` and strictly adhere to `shared/openapi.json`.

---

### Ingestion & Expenses

#### `POST /api/expenses/parse`
- **Description**: Uploads a receipt image/PDF for Gemini Multimodal extraction.
- **Request**: `multipart/form-data` with `file: UploadFile`.
- **Response `200 OK`**:
  ```json
  {
    "vendor": "Airtel Broadband",
    "category": "WIFI",
    "total_amount": 1199.00,
    "tax_amount": 182.88,
    "bill_date": "2026-08-28",
    "due_date": "2026-09-04",
    "items": [
      { "name": "Fiber 200Mbps Plan", "amount": 1016.12, "category": "SUBSCRIPTION" }
    ],
    "confidence_score": 0.99
  }
  ```

#### `POST /api/expenses`
- **Description**: Creates a new expense, computes split shares, generates UPI payment intents, and logs the initial announcement.
- **Request Body**:
  ```json
  {
    "household_id": "hh_01",
    "payer_id": "rm_alex",
    "vendor": "Airtel Broadband",
    "category": "WIFI",
    "total_amount": 1199.00,
    "due_date": "2026-09-04",
    "split_rule": "EQUAL",
    "items": []
  }
  ```
- **Response `201 Created`**: Returns created `Expense` object with array of generated `SplitShare` entities.

#### `GET /api/expenses?household_id={id}`
- **Description**: Retrieves all expenses and split shares for a household.

---

### Payments & Webhooks

#### `POST /api/payments/confirm`
- **Description**: Webhook / callback triggered when a roommate confirms payment.
- **Request Body**:
  ```json
  {
    "split_share_id": "share_402",
    "payment_ref": "UPI/2394019284/PAYTM",
    "confirmed_by": "rm_priya"
  }
  ```
- **Response `200 OK`**: Updates share status to `PAID`, records payment timestamp, and recalculates roommate habit profile in Firestore.

---

### Debt Simplification & Settlement

#### `GET /api/debts/simplify?household_id={id}`
- **Description**: Runs the Min-Cash-Flow graph algorithm on all outstanding debts in the household.
- **Response `200 OK`**:
  ```json
  {
    "raw_debts_count": 6,
    "simplified_transfers_count": 2,
    "total_volume_cleared": 4200.00,
    "settlements": [
      {
        "from_roommate_id": "rm_priya",
        "from_roommate_name": "Priya Sharma",
        "to_roommate_id": "rm_alex",
        "to_roommate_name": "Alex Chen",
        "amount": 1450.00,
        "upi_deep_link": "upi://pay?pa=alex@okaxis&pn=Alex%20Chen&am=1450.00&tn=RoomieOps%20Settlement",
        "qr_code_base64": "data:image/png;base64,..."
      }
    ]
  }
  ```

---

### Autonomous Agent & Time Simulation

#### `POST /api/agent/pulse`
- **Description**: Invoked periodically by **Google Cloud Scheduler** (via Pub/Sub push).
- **Behavior**: Scans all households, detects unpaid shares approaching or past due dates, advances escalation stages, sends notifications, and logs activity.

#### `POST /api/agent/simulate-days`
- **Description**: Time-travel simulation endpoint for live video demo. Fast-forwards the clock by $N$ days and runs the escalation pulse immediately.
- **Request Body**: `{ "days_forward": 3 }`.
- **Response `200 OK`**: Returns array of triggered escalation events and updated activity log entries.

#### `GET /api/agent/activity?household_id={id}`
- **Description**: Returns chronological audit log of all autonomous agent actions.

---

## 2. Firestore Document Data Schema

```
/households/{household_id}
  ├── name: string
  ├── default_currency: "INR"
  ├── roommates: map[string]Roommate
  │
  ├── /expenses/{expense_id}
  │     ├── vendor: string
  │     ├── total_amount: number
  │     ├── status: "PENDING" | "SETTLED"
  │     └── /shares/{share_id}
  │           ├── roommate_id: string
  │           ├── amount_owed: number
  │           ├── status: "UNPAID" | "PAID"
  │           └── escalation_stage: "STAGE_1" | "STAGE_2" | "STAGE_3" | "STAGE_4"
  │
  ├── /activity_logs/{log_id}
  │     ├── timestamp: timestamp
  │     ├── event_type: string
  │     ├── title: string
  │     └── description: string
  │
  └── /memory_bank/{roommate_id}
        ├── avg_settlement_hours: number
        ├── on_time_ratio: number
        ├── total_bills_settled: number
        └── habit_badge: string
```
