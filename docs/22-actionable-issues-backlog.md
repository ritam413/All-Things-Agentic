# 22 - Actionable Issues Backlog & Realigned Ticket Graph

## Realignment Notice: Team Allocation Update
- **Dev 1 (Lead Full-Stack / AI & Integration Engine)**: Owns `backend/`, `shared/`, and `cloud/`. Builds the AI agent, tools, algorithms, API gateway, and cloud setup.
- **Dev 2 (Frontend & UI Component Specialist)**: Owns `frontend/`. Builds the Next.js glassmorphic dashboard, multimodal dropzone, debt graph visualizer, activity stream, and payment modals.
- **Dev 3 (Auxiliary / Polish - Low Dependency)**: Minimal non-blocking work (sample receipt image assets, static documentation polish, presentation slides). Core app operates with 0% dependency on Dev 3.

---

## 1. Updated Task Graph & Ticket Allocation

```mermaid
graph TD
    T01["[DEV 1] T-01: Shared API Contract, Types & Mock Fixtures"] --> T02["[DEV 1] T-02: Gemini Vision Receipt Parser"]
    T01 --> T03["[DEV 1] T-03: Split Engine & Math"]
    T01 --> T04["[DEV 1] T-04: Min-Cash-Flow Debt Simplifier"]
    T01 --> T05["[DEV 2] T-05: Next.js Layout & Glassmorphism Design System"]
    
    T02 & T05 --> T06["[DEV 2] T-06: Receipt Dropzone & Extraction Drawer UI"]
    T03 --> T07["[DEV 1] T-07: UPI Deep Link & QR Code Generator"]
    T04 & T05 --> T08["[DEV 2] T-08: Interactive Debt Network Graph Visualizer"]
    T07 & T05 --> T09["[DEV 2] T-09: One-Tap UPI Payment Modal UI"]
    
    T03 & T07 --> T10["[DEV 1] T-10: 4-Stage Autonomous Tone Escalation Engine"]
    T10 & T05 --> T11["[DEV 2] T-11: Live Agent Activity Stream UI"]
    T10 --> T12["[DEV 1] T-12: Time-Travel Fast-Forward Simulator & Pulse Webhooks"]
    
    T06 & T08 & T09 & T11 & T12 --> T13["[DEV 1] T-13: Cloud Run Deployment & E2E Validation"]
    T13 --> T14["[DEV 3] T-14: Auxiliary Demo Assets & Deck Polish (Non-blocking)"]
```

---

## 2. Active Ticket Frontier

| Ticket | Assigned Dev | Domain / Files | Status |
|---|---|---|---|
| **T-01** | **Dev 1** | `shared/schema.py`, `shared/types.ts`, `shared/mock_data/` | **Ready to Build** |
| **T-02** | **Dev 1** | `backend/app/agent/tools/receipt_parser.py` | **Ready to Build** |
| **T-03** | **Dev 1** | `backend/app/agent/tools/split_calculator.py` | **Ready to Build** |
| **T-04** | **Dev 1** | `backend/app/agent/tools/debt_simplifier.py` | **Ready to Build** |
| **T-05** | **Dev 2** | `frontend/` (Next.js layout, CSS tokens, shell) | **Ready to Build** |
| **T-07** | **Dev 1** | `backend/app/agent/tools/payment_links.py` | **Ready to Build** |
| **T-10** | **Dev 1** | `backend/app/agent/tools/escalation_engine.py` | **Ready to Build** |
| **T-12** | **Dev 1** | `backend/app/api/routes.py`, `backend/app/main.py` | **Ready to Build** |
| **T-13** | **Dev 1** | `cloud/Dockerfile`, `cloud/deploy.sh` | **Ready to Build** |
| **T-14** | **Dev 3** | `docs/assets/`, presentation deck | **Auxiliary (Postponed)** |
