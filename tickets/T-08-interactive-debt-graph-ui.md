# Ticket T-08: Interactive Debt Network Graph Visualizer UI

- **Assignee**: **Dev 2** (Frontend & Multimodal UX Specialist)
- **Domain**: `frontend/src/components/`
- **Dependencies**: `T-04`, `T-05`
- **Status**: Completed

---

## Objective
Build an interactive visualizer comparing raw mutual debts against optimized Min-Cash-Flow settlements.

## Target Files
- `frontend/src/components/DebtGraph.tsx`
- `frontend/src/services/api.ts`

## Acceptance Criteria
- [x] Displays comparative summary metrics: Raw Transfers vs Optimized Transfers vs Total Volume.
- [x] Lists each simplified transfer with directional arrow (`Priya ➔ Alex`) and amount.
- [x] Provides direct "UPI Pay ↗" action button to trigger the payment modal.
