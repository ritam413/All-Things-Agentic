# 01 - Product Requirements Document (PRD)

## Project Name: RoomieOps AI (Autonomous Roommate Rent & Expense Ops Agent)
**Tagline:** An autonomous, background ops agent that eliminates the awkwardness of roommate expense splitting through multimodal receipt ingestion, dynamic UPI deep links, intelligent debt simplification, and adaptive autonomous escalation.  
**Event:** Google "All Things Agentic Hackathon" | Devpost 2026  
**Target Track:** **The Taskmaster** (Building a complete autonomous workflow that handles multi-step chores asynchronously)  
**Document Version:** 1.0.0 (Production Specification)  
**Authors:** 3-Developer FDD Engineering Team (Backend & AI, Integration & Cloud, Frontend & UX)  

---

## 1. Problem Statement & Market Opportunity

### 1.1 The Roommate Expense Friction Loop
In shared apartments, flats, and PG accommodations, managing household expenses (rent, electricity, gas, high-speed internet, shared groceries, maintenance) is a chronic source of interpersonal friction:
1. **Unorganized Receipts:** Bills arrive irregularly across emails, paper receipts, and WhatsApp screenshots.
2. **Manual Math Burden:** Someone must manually calculate shares, account for different room dimensions or custom split rules, and track who paid what.
3. **The "Awkward Nagging" Tax:** Roommates hate repeatedly chasing friends for money over chat. Reminders are either forgotten, delayed, or cause social discomfort.
4. **Tangled Month-End IOUs:** Multiple overlapping purchases create circular debts (e.g., Alice owes Bob $30 for wifi, Bob owes Charlie $20 for groceries, Charlie owes Alice $15 for power).

### 1.2 The Passive Ledger Limitation (Why Splitwise Fails)
Existing tools like Splitwise are **passive calculators**:
- They require a human to manually key in numbers and categories.
- They wait passively for users to initiate reminders manually.
- They do not autonomously track due dates or execute background escalation.
- They lack behavioral memory of chronic late payment habits.

### 1.3 The RoomieOps AI Solution
RoomieOps AI is an **autonomous ops agent** that operates unattended in the background:
- **Multimodal Ingestion**: Ingests receipt photos or PDF bills via **Gemini 2.5/3.5 Multimodal** with structured extraction.
- **Configurable Splits**: Automatically computes shares (Equal, Room-Square-Footage, Custom Percentage, Itemized).
- **One-Tap UPI Deep Links**: Generates instant `upi://pay` links and scannable QR codes for seamless mobile settlement (GPay/PhonePe/Paytm).
- **Autonomous Escalation Engine**: An unattended cron worker (Google Cloud Scheduler + Pub/Sub + Cloud Run) that evaluates unpaid balances and progresses through 4 adaptive tones (Friendly $\rightarrow$ Nudge $\rightarrow$ Firm $\rightarrow$ Overdue Alert).
- **Min-Cash-Flow Debt Simplification**: Graph reduction algorithm that compresses $N$ tangled debts into the minimum possible transactions.
- **Firestore Behavioral Memory**: Tracks payment velocity and awards dynamic habit badges (`⚡ Rapid Settler`, `⚠️ Chronic Late Payer`).

---

## 2. Target Personas & User Journeys

### Persona A: Alex Chen (The Household Administrator / Leaseholder)
- **Profile:** 27-year-old software engineer living with 3 roommates in a 4-bedroom flat. Fronts the rent and electricity bill.
- **Pain Points:** Tired of doing spreadsheet math, hates following up on WhatsApp, spends 2 hours every month reconciling receipts.
- **Goal:** Drop a photo of the utility bill into RoomieOps, select "By Room Size", and let the agent handle calculations, payment link generation, and automated follow-ups.

### Persona B: Priya Sharma (The Busy Roommate / Payer)
- **Profile:** 24-year-old marketing specialist. Often forgets to check group chats for bill splits.
- **Pain Points:** Misses deadlines because payment instructions lack direct links or require manual bank account typing.
- **Goal:** Receive a clear payment notification with a one-tap UPI link, tap once to pay in PhonePe, and confirm settlement with zero typing.

### Persona C: Hackathon Judging Committee (Google Cloud & Devpost)
- **Profile:** Evaluating autonomous utility (40%), architectural discipline (30%), and production readiness (30%).
- **Goal:** Verify that RoomieOps is a true autonomous background agent (not a toy chatbot) running reliably on Google Cloud services (Gemini, Cloud Run, Firestore, Pub/Sub, Cloud Scheduler).

---

## 3. Product Principles & Invariants

1. **The Autonomous Execution Invariant:**
   The agent MUST execute monitoring, tone escalation, and debt reconciliation in the background without human initiation.
2. **The Zero-Payment-Gateway Invariant:**
   To guarantee safety, zero fees, and zero live transaction liability during judging, payments are executed via client-side UPI Deep Links (`upi://pay`) and QR codes, paired with instant webhook confirmations.
3. **The Single Source of Truth Invariant:**
   All API contracts and shared data types (`shared/openapi.json`) govern communication between Backend, Integration, and Frontend to eliminate merge conflicts in the 3-developer team.
4. **The Behavioral Memory Invariant:**
   Every payment event updates the roommate's long-term habit profile in Firestore, enabling historical insights and late-payer trend detection.

---

## 4. Key Metrics & Success Criteria

| Metric | Passive Ledgers (Splitwise) | RoomieOps AI Target |
|---|---|---|
| **Time-to-Request** | Hours to days (manual) | < 15 seconds after receipt drop |
| **Manual Steps per Bill** | 5 (enter amount, select roommates, split, send, nag) | 1 (upload receipt photo) |
| **Automated Follow-up Rate** | 0% (requires human tap) | 100% autonomous unattended follow-up |
| **Transaction Reduction** | Naive pairwise transfers | Minimized via Min-Cash-Flow graph solver |
| **Deployment Proof** | Local/SaaS | Live Google Cloud Run + Firestore + Cloud Scheduler |
