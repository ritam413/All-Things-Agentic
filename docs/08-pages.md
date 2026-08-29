# 08 - Application Pages & View Hierarchy

## 1. Page Routes & Layout Hierarchy

```
frontend/src/app/
├── layout.tsx                  (Root layout: Glassmorphic theme, Google Fonts Inter/Outfit, Header & Navbar)
├── page.tsx                    (Main Command Center: Receipt Ingestion, Ledger, Debt Graph, Live Agent Feed)
├── household/
│   └── page.tsx                (Household Settings: Roommate roster, room sq ft, UPI VPAs, split rules)
├── analytics/
│   └── page.tsx                (Behavioral Analytics: Late-payer velocity, spend category radar)
└── audit/
    └── page.tsx                (Complete Autonomous Agent Execution & Cron Audit Log)
```

---

## 2. Main Command Center (`/`) Layout

The main page is structured in a high-density, 3-column glassmorphic layout designed to showcase all autonomous agent actions at a glance:

```
+-----------------------------------------------------------------------------------------------+
| Header: RoomieOps AI  |  🟢 Autonomous Agent: ACTIVE (Next scan: 12m)  |  Simulate +3 Days ⚡ |
+-----------------------------------------------------------------------------------------------+
| Column 1: Ingestion & Split   | Column 2: Ledger & Debt Graph   | Column 3: Agent Activity Log|
| - Drag & Drop Receipt Zone    | - Active Expenses & Shares      | - Live Autonomous Actions   |
| - Preset Sample Bill Pickers  | - Pending Payments & UPI Modals | - Stage 1/2/3/4 Nudges Sent |
| - Gemini Extraction Preview   | - Min-Cash-Flow Debt Graph      | - Firestore Memory Updates  |
| - Split Rule Selector         |   (Before: 6 -> After: 2)       | - Cron Heartbeat Pulses     |
+-----------------------------------------------------------------------------------------------+
```

---

## 3. Responsive Breakpoints & Device Support
- **Desktop (>= 1280px)**: 3-column unified command deck.
- **Tablet (768px - 1279px)**: 2-column layout (Left: Ingestion & Ledger, Right: Agent Feed & Graph).
- **Mobile (< 768px)**: Tabbed navigation with direct one-tap UPI deep link triggers.
