# Ticket T-07: UPI Deep Link & Base64 QR Code Generator Tool

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `backend/app/agent/tools/`
- **Dependencies**: `T-01`
- **Status**: Completed

---

## Objective
Implement client-ready UPI deep link URI string formatting and Base64-encoded PNG QR code rendering.

## Target Files
- `backend/app/agent/tools/payment_links.py`
- `backend/tests/test_payment_links.py`

## Acceptance Criteria
- [x] Generates valid `upi://pay?pa=...&pn=...&am=...&tn=...&cu=INR` URI strings.
- [x] Returns Base64-encoded PNG QR codes matching the exact deep link.
- [x] Handles missing `qrcode` library gracefully with fallback image strings.
