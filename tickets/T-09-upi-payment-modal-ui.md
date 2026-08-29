# Ticket T-09: One-Tap UPI Payment Modal UI

- **Assignee**: **Dev 2** (Frontend & Multimodal UX Specialist)
- **Domain**: `frontend/src/components/`
- **Dependencies**: `T-07`, `T-05`
- **Status**: Completed

---

## Objective
Build the interactive modal displaying the dynamic UPI QR code, mobile app launcher, and webhook confirmation trigger.

## Target Files
- `frontend/src/components/PaymentModal.tsx`
- `frontend/src/services/api.ts`

## Acceptance Criteria
- [x] Renders the dynamic Base64 QR code image.
- [x] Primary button opens native mobile UPI apps via `upi://pay` deep link.
- [x] Secondary button triggers `POST /api/payments/confirm` webhook simulator.
