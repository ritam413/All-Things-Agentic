# RoomieOps AI: Autonomous Expense & Debt Settlement Agent
## Google All Things Agentic Hackathon — Track 1: The Taskmaster (,000 Category Prize + ,000 Grand Prize)

---

## Slide 1: Title Slide & Hook
- **Title**: RoomieOps AI (Roommate Rent Ops Agent)
- **Subtitle**: Turning awkward household bill nagging into an autonomous background operator
- **Team**: Dev 1 (Lead Full-Stack / AI Integration), Dev 2 (Frontend & UX Specialist), Dev 3 (Auxiliary & Product Polish)
- **Visual**: Split-screen showing the chaos of WhatsApp group chats with unpaid bills vs the sleek RoomieOps AI autonomous dashboard.
- **Presenter Script (0:00 - 0:45)**:
  > *Every shared flat lives through the same awkward chore: bills pile up on the counter, someone does messy spreadsheet math, and someone has to repeatedly nag roommates for money on WhatsApp. Existing apps like Splitwise are passive ledgers—they calculate debt, but leave 100% of the emotional labor to humans. We built RoomieOps AI: a truly autonomous agent that takes real action end-to-end on Google Cloud.*

---

## Slide 2: The Problem — The Passive Ledger Trap
- **Headline**: Calculation != Collection
- **Key Friction Points**:
  1. **Manual Data Entry Burden**: Typing OCR totals line-by-line is tedious and error-prone.
  2. **Complex Multi-Rule Splitting**: Master bedrooms vs small rooms, itemized personal items vs shared utilities.
  3. **Social Friction & Late Payments**: Chronic late payers exploit social awkwardness; roommates hate confronting friends.
  4. **Pairwise Debt Chaos**: 6 roommates racking up 15 redundant circular IOUs across different apps.

---

## Slide 3: The Solution — RoomieOps Autonomous Agent
- **Headline**: An Unattended Background Taskmaster
- **Core Pillars**:
  - Multimodal Ingestion: Gemini Multimodal directly ingests crumpled receipts, utility invoices, and electricity meters.
  - Mathematical Precision Splitting: 4 customizable modes (Equal, Room Area ft^2, Custom %, Itemized) with guaranteed penny conservation (sum(Shares) == Total).
  - Zero-Friction UPI Settlement: Dynamic upi://pay deep links and base64 QR codes for 1-tap mobile settlement without holding custodian funds.
  - Autonomous Tone Escalation: Unattended hourly background crons evaluating due dates and escalating from friendly announcements to firm deadlines and overdue flags.
  - Min-Cash-Flow Debt Simplification: Graph-theoretic bipartite cash-flow algorithm reducing N(N-1)/2 pairwise debts to at most N-1 optimal transfers.
  - Household Memory Bank: Firestore tracking payment velocities, chronic late habits, and dynamic habit badges (RELIABLE, PROCRASTINATOR, CHRONIC_LATE).

---

## Slide 4: System Architecture on Google Cloud
- **Headline**: Enterprise-Grade, Decoupled, Cloud-Native Architecture
- **Tech Stack & Google Cloud Services**:
  - **Google Cloud Run**: Autoscaling stateless FastAPI backend service.
  - **Google Cloud Scheduler**: Hourly cron trigger firing /api/agent/pulse.
  - **Google Cloud Firestore**: Dual-mode document store with persistent memory banks.
  - **Google Gemini 2.0 / 1.5 Pro Multimodal**: Document vision parser with JSON sanitization.
  - **Next.js 14 / TypeScript**: Real-time glassmorphic operations dashboard.

---

## Slide 5: Live Demo Highlights (4-Minute Pitch)
- **Step 1 — Multimodal Ingestion**: Dropping actual electricity/Wi-Fi bills with automatic line-item parsing and room-size weighted shares.
- **Step 2 — Settlement Matrix (Who Has Paid vs Who Is Left)**: Real-time aggregate debt bar, member segmentation, and 1-tap UPI triggers.
- **Step 3 — Time-Travel Simulator**: Fast-forwarding +3 days and +7 days to demonstrate autonomous 4-stage tone escalation in action.
- **Step 4 — Debt Graph Simplification**: Reducing 6 pairwise debts to 2 minimal transfers.
- **Step 5 — Multi-Group & Profile Customization**: Seamless switching between households and updating UPI handles in real time.

---

## Slide 6: Mathematical Proof & Graph Theory
- **Headline**: Optimal Min-Cash-Flow Optimization
- **Algorithm Properties**:
  - Computes net balance array B[i] = sum(Credit) - sum(Debit).
  - Invariant: sum_{i=1}^N B[i] = 0.
  - Greedy bipartite max-heap matching between maximum creditor and maximum debtor in integer cents.
  - Guaranteed Upper Bound: Never exceeds N - 1 total cash settlements (where N = number of participants).
  - Reduces social and banking transaction volume by up to 75%.

---

## Slide 7: Business Impact & Judging Rubric Alignment
- **Rubric Criteria**:
  1. **Innovation & Operational Utility (40%)**: Solves an unattended background chore; eliminates awkward human friction; provides time-travel simulation for verifiable agentic behavior.
  2. **Architectural Discipline & Depth (30%)**: Deep module architecture, clean seams (Ousterhout principles), strict penny conservation, 86 unit/integration tests with 100% pass rate.
  3. **Demo & Cloud Readiness (30%)**: Production-ready Docker container, Cloud Run deploy scripts, Cloud Scheduler crons, live multi-group switching.

---

## Slide 8: Future Roadmap & Extensibility
- **What's Next for RoomieOps**:
  - Automated WhatsApp / Telegram bot webhooks for automated receipt ingestion.
  - Open Banking account-to-account reconciliation (Plaid / Setu UPI auto-verification).
  - Multi-household landlord / property manager portal with aggregate energy usage analytics.

---

## Slide 9: Conclusion & Call to Action
- **Closing**: RoomieOps AI transforms household finances from a stressful weekly human argument into an intelligent, background autonomous agent on Google Cloud.
- **Live Demo Link**: https://roomieops-ai.web.app (or local port 3000)
- **API Spec**: /docs (FastAPI Swagger OpenAPI 3.1)
- **Repository**: GitHub All-Things-Agentic/RoomieOps-AI
