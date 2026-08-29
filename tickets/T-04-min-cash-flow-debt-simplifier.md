# Ticket T-04: Min-Cash-Flow Debt Simplification Algorithm

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `backend/app/agent/tools/`
- **Dependencies**: `T-01`
- **Status**: Completed

---

## Objective
Implement the Greedy Min-Cash-Flow graph solver that compresses $N$ mutual debts into the minimal number of direct settlements ($\le N-1$).

## Target Files
- `backend/app/agent/tools/debt_simplifier.py`
- `backend/tests/test_debt_simplifier.py`

## Acceptance Criteria
- [x] Computes exact Net Cash Balances for all roommates.
- [x] Uses greedy max-debtor and max-creditor heap matching.
- [x] Eliminates circular debt loops.
- [x] Attaches generated UPI deep links to each resulting settlement.
