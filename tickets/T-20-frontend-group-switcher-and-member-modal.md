# Ticket T-20: Frontend Multi-Group Switcher & Add Roommate / People Dialog

- **Assignee**: **Dev 2** (Frontend & UX Specialist)
- **Domain**: `frontend/`
- **Dependencies**: T-15, T-17
- **Status**: Ready for Implementation

---

## Objective
Implement UI for switching between multiple groups/households, creating new groups, and adding new roommates/people with room square-footage and UPI handle validations.

## Target Files
- `frontend/src/components/GroupManagementModal.tsx` (Create group modal & Add Roommate dialog)
- `frontend/src/services/api.ts` (Group & member management API calls)
- `frontend/src/app/page.tsx` (Group switcher dropdown in header)

## Acceptance Criteria
- [ ] Group dropdown allows switching between active groups and triggering "Create New Group".
- [ ] "Add Roommate" modal validates UPI handle, room area, name, and email before submission.
- [ ] Adding a roommate immediately refreshes the dashboard, split calculations, and debt graphs.
- [ ] TypeScript type checks pass (`npm run typecheck`).
