# Ticket T-09: One-Tap UPI Payment Modal UI

- **Assignee**: **Dev 2** (Frontend & Multimodal UX Specialist)
- **Domain**: `frontend/src/components/`
- **Dependencies**: `T-07`, `T-05`
- **Status**: Ready

---

## Objective
Build the interactive modal displaying the dynamic UPI QR code, mobile app launcher, and webhook confirmation trigger.

## Target Files
- `frontend/src/components/PaymentModal.tsx`
- `frontend/src/services/api.ts`

## Acceptance Criteria
- [ ] Renders the dynamic Base64 QR code image.
- [ ] Primary button opens native mobile UPI apps via `upi://pay` deep link.
- [ ] Secondary button triggers `POST /api/payments/confirm` webhook simulator.
