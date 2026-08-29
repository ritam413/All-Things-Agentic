# Ticket T-18: AI & Backend Settlement Matrix & "Who Has Paid vs Who Is Left" Engine

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `backend/`
- **Dependencies**: T-15, T-17
- **Status**: Completed

---

## Objective
Implement an aggregation engine and endpoint to compute real-time household settlement status: who has paid, who is left to pay, total paid vs pending volumes, and escalation urgency stages.

## Target Files
- `backend/app/agent/core.py` (Settlement aggregation and member status compiler)
- `backend/app/api/routes.py` (Expose `GET /api/households/{id}/settlement-status`)
- `frontend/src/services/api.ts` (Client helper `fetchSettlementStatus`)
- `backend/tests/test_settlement_status.py` (TDD unit & integration tests)

## Acceptance Criteria
- [x] TDD unit tests verifying exact calculation of `total_billed`, `total_paid`, and `total_pending`.
- [x] Correctly segments members into `paid_members` (100% cleared) and `pending_members` (outstanding debt with escalation stage).
- [x] Real-time update when an individual share or debt settlement is confirmed.
- [x] All tests in `test_settlement_status.py` passing green.

