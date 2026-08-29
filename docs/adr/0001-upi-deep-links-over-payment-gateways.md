# ADR 0001: UPI Deep Links Over Hosted Payment Gateways

## Status
Accepted

## Context
Roommates need a frictionless, zero-barrier way to settle split shares directly from their mobile phones. Traditional approaches require integrating payment gateways (Razorpay, Stripe) which introduce merchant onboarding, KYC verification, processing fees (1.5-3%), PCI-DSS compliance scope, and real financial liability during live hackathon demos.

## Decision
We will generate standard **UPI Deep Links** (`upi://pay?pa=<payee_vpa>&pn=<payee_name>&am=<amount>&tn=<note>`) and render scannable QR codes client-side. Payment confirmation will use a lightweight "Mark as Paid / Enter UPI Reference" callback webhook rather than a live banking webhook.

## Consequences
- **Positive**: Zero API keys, zero gateway fees, zero KYC overhead, and 100% genuine one-tap payments on GPay, PhonePe, and Paytm.
- **Positive**: Zero risk of real monetary loss or unexpected charges during live hackathon judging.
- **Negative**: Relies on human confirmation / reference input rather than automated bank statement reconciliation.
