# Ticket T-16: AI & Backend Auth Service & User Profile API

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `backend/`
- **Dependencies**: T-15
- **Status**: Completed

---

## Objective
Implement user registration, authentication, JWT/session token management, user profile updates, and fast demo persona switching.

## Target Files
- `backend/app/services/auth_service.py` (Auth business logic, user repository, password hashing, session tokens)
- `backend/app/api/routes.py` (Expose `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/profile`, `/api/auth/personas`)
- `backend/tests/test_auth.py` (TDD unit & integration tests)

## Acceptance Criteria
- [x] TDD unit tests in `test_auth.py` verifying registration, login, token authentication, and profile updates.
- [x] Support password hashing and token generation.
- [x] Support fast demo persona switching (e.g. Alex, Priya, Rahul, Sam) for zero-credential hackathon demos.
- [x] All tests in `test_auth.py` passing green.
