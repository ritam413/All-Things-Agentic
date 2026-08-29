# Ticket T-19: Frontend Auth Context, Profile Modal & Persona Quick-Switcher

- **Assignee**: **Dev 2** (Frontend & UX Specialist)
- **Domain**: `frontend/`
- **Dependencies**: T-15, T-16
- **Status**: Completed

---

## Objective
Implement client-side authentication state management, user profile modal (edit UPI handle, name, phone, currency), and quick-demo persona switcher in the header.

## Target Files
- `frontend/src/context/AuthContext.tsx` (User state, login/register/logout actions, localStorage persistence)
- `frontend/src/components/UserProfileModal.tsx` (Glassmorphic profile modal with live UPI handle updates)
- `frontend/src/components/AuthModal.tsx` (Glassmorphic custom Login & Register modal)
- `frontend/src/services/api.ts` (Auth API client methods)
- `frontend/src/app/page.tsx` (Header integration with avatar badge & quick-switcher)

## Acceptance Criteria
- [x] User can log in, register, or switch between preloaded roommate personas (Alex, Priya, Rohan, Sam) with 1 click.
- [x] User profile modal allows updating UPI VPA handle and details.
- [x] TypeScript type checks pass (`npm run typecheck`).

