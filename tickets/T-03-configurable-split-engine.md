# Ticket T-03: Configurable Split Calculation Engine

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `backend/app/agent/tools/`
- **Dependencies**: `T-01`
- **Status**: Completed

---

## Objective
Implement pure functional split calculation with exact penny conservation ($\sum \text{Shares} \equiv \text{Total}$).

## Target Files
- `backend/app/agent/tools/split_calculator.py`
- `backend/tests/test_split_calculator.py`

## Acceptance Criteria
- [x] Supports `EQUAL` split with penny remainder distributed across first $k$ roommates.
- [x] Supports `ROOM_AREA` weighted split proportional to square footage.
- [x] Supports `PERCENTAGE` custom split matrices.
- [x] Automated tests pass verifying penny conservation across all 4 modes.
