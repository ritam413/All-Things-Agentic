# Ticket T-17: AI & Backend Multi-Group / Household & Roommate Addition API

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `backend/`
- **Dependencies**: T-15
- **Status**: Completed

---

## Objective
Implement multi-group/household creation, group listing, adding roommates/people with room square footage and UPI handles, and removing members.

## Target Files
- `backend/app/services/firestore_service.py` (Multi-household persistence, member CRUD, user-group association)
- `backend/app/api/routes.py` (Expose `POST /api/households`, `GET /api/households`, `POST /api/households/{id}/members`, `DELETE /api/households/{id}/members/{roommate_id}`)
- `backend/tests/test_groups.py` (TDD unit & integration tests)

## Acceptance Criteria
- [x] TDD unit tests in `test_groups.py` verifying group creation, member addition, roommate deletion, and group isolation.
- [x] Adding a roommate automatically initializes their `HabitProfile` in the memory bank.
- [x] New expenses properly split among dynamically updated group roommates.
- [x] All tests in `test_groups.py` passing green.
