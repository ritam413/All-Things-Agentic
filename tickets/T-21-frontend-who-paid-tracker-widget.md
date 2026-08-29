# Ticket T-21: Frontend "Who Has Paid vs Who Is Left" Dashboard Widget

- **Assignee**: **Dev 2** (Frontend & UX Specialist)
- **Domain**: `frontend/`
- **Dependencies**: T-15, T-18
- **Status**: Completed

---

## Objective
Implement a high-visibility, glassmorphic dashboard component to track who has paid vs who is left to pay across active household expenses, complete with escalation badges and one-tap payment/nudge actions.

## Target Files
- `frontend/src/components/WhoPaidTracker.tsx` (Paid vs Left breakdown, progress meter, filter tabs, quick pay/nudge triggers)
- `frontend/src/services/api.ts` (Settlement status API hook)
- `frontend/src/app/page.tsx` (Dashboard layout integration)

## Acceptance Criteria
- [x] Aggregate meter showing Total Paid (₹) vs Total Left / Outstanding (₹) with percentage progress bar.
- [x] "Paid Roommates" view showing green verified checkmarks, paid amounts, and timestamps.
- [x] "Left to Pay" view showing pending amounts, due date countdowns, and Escalation Stage pills (Stage 1 to Stage 4).
- [x] One-tap "Pay UPI" triggers the existing `PaymentModal.tsx`.
- [x] TypeScript type checks pass (`npm run typecheck`).
