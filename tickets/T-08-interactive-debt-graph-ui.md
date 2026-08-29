# Ticket T-08: Interactive Debt Network Graph Visualizer UI

- **Assignee**: **Dev 2** (Frontend & Multimodal UX Specialist)
- **Domain**: `frontend/src/components/`
- **Dependencies**: `T-04`, `T-05`
- **Status**: Ready

---

## Objective
Build an interactive visualizer comparing raw mutual debts against optimized Min-Cash-Flow settlements.

## Target Files
- `frontend/src/components/DebtGraph.tsx`
- `frontend/src/services/api.ts`

## Acceptance Criteria
- [ ] Displays comparative summary metrics: Raw Transfers vs Optimized Transfers vs Total Volume.
- [ ] Lists each simplified transfer with directional arrow (`Priya ➔ Alex`) and amount.
- [ ] Provides direct "UPI Pay ↗" action button to trigger the payment modal.
