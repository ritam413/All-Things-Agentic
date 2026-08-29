# 23 - Team Design Alignment & Edge-Case Questionnaire

This document captures settled design decisions and resolved edge cases across the 3-developer team.

---

## 1. Resolved Design Decisions

### Q1: How do we handle roommates paying different amounts due to unequal room sizes?
- **Resolution**: Roommates enter their room square-footage in household settings (e.g. 200 sqft, 300 sqft, 500 sqft). For rent and fixed utility bills, the user can toggle "Weighted by Room Size", which computes $\text{Share}_i = \text{Total} \times \frac{\text{Area}_i}{\sum \text{Area}}$.

### Q2: What happens when the Gemini vision model extracts an invoice with no visible due date?
- **Resolution**: The `ReceiptParser` fallback engine automatically computes $\text{DueDate} = \text{BillDate} + 7\text{ days}$, while allowing the user to adjust the date in the Live Review Drawer before saving.

### Q3: How do we guarantee the demo works if the internet or Gemini API rate limit is reached during live judging?
- **Resolution**: Dual-adapter pattern. The backend has pre-loaded sample bills (Rent, Electricity, Wifi, Groceries) in `shared/mock_data/`. If `MOCK_GEMINI=true` or if a network error occurs, it smoothly returns valid mock extractions without throwing UI errors.

### Q4: Why UPI Deep Links instead of Razorpay or Stripe?
- **Resolution**: UPI deep links (`upi://pay`) provide 100% genuine one-tap mobile payments on Indian UPI apps (GPay, PhonePe, Paytm) with zero fees, zero merchant onboarding, zero KYC liability, and zero risk of accidental financial transactions during hackathon judging.
