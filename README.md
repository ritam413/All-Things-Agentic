# 🏠 RoomieOps AI — Autonomous Roommate Rent & Expense Ops Agent

> **Built for the Google "All Things Agentic Hackathon" 2026**  
> **Track:** *The Taskmaster* (Building a complete, unattended autonomous workflow that eliminates everyday friction)

---

## 🌟 Executive Summary

Every month, shared households and roommates go through the same awkward, time-consuming administrative cycle:
1. Bills and receipts pile up across utility emails, paper receipts, and grocery screenshots.
2. Someone manually calculates who owes what, juggling custom split rules and room dimensions.
3. Someone has to repeatedly and awkwardly chase friends for money over WhatsApp.
4. Month-end devolves into a tangle of mutual IOUs (*"you owe me for wifi, but I owe you for power"*).

**Splitwise solves the math, but not the friction.** It is a passive ledger that waits for humans to enter numbers and initiate reminders.

**RoomieOps AI** transforms passive tracking into an **autonomous, unattended background agent** that handles the entire roommate expense lifecycle end-to-end:
- 📸 **Multimodal Ingestion**: Uses **Gemini 2.5 / 3.5 Multimodal Vision** to extract items, dates, taxes, and totals from receipt photos or PDF bills with zero manual entry.
- 📐 **Configurable Split Calculation**: Automatically applies household rules (Equal, Room Square-Footage, Custom %, Itemized Exclusions) with penny conservation.
- ⚡ **Direct UPI Deep Links**: Generates instant one-tap `upi://pay` mobile deep links and scannable QR codes for GPay, PhonePe, and Paytm.
- ⏰ **Autonomous Asynchronous Escalation**: Runs in the background via **Google Cloud Scheduler + Pub/Sub + Cloud Run**, monitoring due dates and adapting follow-up tones across 4 stages (Friendly $\rightarrow$ Nudge $\rightarrow$ Deadline $\rightarrow$ Overdue Alert).
- 🔄 **Debt Simplification Engine**: Implements the mathematical **Greedy Min-Cash-Flow Algorithm**, compressing $N$ tangled mutual debts into the minimum possible transactions.
- 🧠 **Behavioral Memory Bank**: Persists roommate payment velocity and habit badges (`⚡ Rapid Settler`, `⚠️ Chronic Late Payer`) in **Google Cloud Firestore**.

---

## 🏛️ System Architecture & Google Cloud Topology

```mermaid
flowchart TB
    subgraph ClientLayer ["Layer 1: Next.js 14 Dashboard (Glassmorphism UI)"]
        direction TB
        UI_Drop["📸 Multimodal Ingestion Dropzone<br/>(Live Gemini Vision Extraction Preview)"]
        UI_Ledger["📊 Active Expense Ledger & Split Manager"]
        UI_Graph["🔄 Interactive Debt Network Graph<br/>(Before vs After Min-Cash-Flow Visualizer)"]
        UI_Stream["⚡ Real-Time Agent Activity & Audit Stream<br/>(Live Background Decision Feed)"]
        UI_PayModal["📲 One-Tap UPI QR & Deep Link Modal"]
        UI_TimeTravel["⏳ Time-Travel Simulator Slider (+3d, +7d)"]
    end

    subgraph GatewayLayer ["Layer 2: API Gateway & Shared Contract (FastAPI / Cloud Run)"]
        direction TB
        Contract["Single Source of Truth Schema<br/>(shared/schema.py & shared/types.ts)"]
        API_Route["REST API Controllers"]
        API_Webhook["Payment Confirmation & Time Pulse Webhooks"]
    end

    subgraph AgentCoreLayer ["Layer 3: Autonomous Agent Core (Google ADK / GenAI SDK)"]
        direction TB
        Agent_Controller["🤖 Autonomous Agent Orchestrator"]
        
        Tool_Vision["parse_receipt()<br/>Gemini Multimodal Vision Tool"]
        Tool_Split["calculate_split()<br/>Household Split Rules Engine"]
        Tool_UPI["generate_payment_link()<br/>UPI Deep Links & QR Generator"]
        Tool_Graph["simplify_debts()<br/>Min-Cash-Flow Graph Solver"]
        Tool_Tone["escalate_reminders()<br/>4-Stage Adaptive Tone Engine"]
        Tool_Memory["memory_bank()<br/>Behavioral Habit Profiler"]
        
        Agent_Controller --> Tool_Vision
        Agent_Controller --> Tool_Split
        Agent_Controller --> Tool_UPI
        Agent_Controller --> Tool_Graph
        Agent_Controller --> Tool_Tone
        Agent_Controller --> Tool_Memory
    end

    subgraph GoogleCloudLayer ["Layer 4: Google Cloud Infrastructure"]
        direction TB
        GCP_Gemini["✨ Gemini 2.5 / 3.5 Flash<br/>(Multimodal Vision & Extraction Engine)"]
        GCP_Firestore[("🔥 Google Cloud Firestore<br/>(Households, Expenses, Logs, Memory Bank)")]
        GCP_Scheduler["⏱️ Google Cloud Scheduler<br/>(Periodic Hourly Cron Pulse)"]
        GCP_PubSub["📬 Cloud Pub/Sub<br/>(Topic: rentops-cron)"]
        
        GCP_Scheduler -->|Periodic Pulse| GCP_PubSub
        GCP_PubSub -->|Push Subscription| API_Webhook
        Tool_Vision <-->|Structured Schema| GCP_Gemini
        Agent_Controller <-->|Read / Write State| GCP_Firestore
    end

    ClientLayer <-->|REST API / SSE| GatewayLayer
    GatewayLayer <--> AgentCoreLayer
```

---

## 🔄 Autonomous Lifecycle & State Machine

```mermaid
stateDiagram-v2
    [*] --> IngestBill: User drops photo of utility bill / receipt
    IngestBill --> ParseReceipt: Gemini Multimodal Vision Extraction
    ParseReceipt --> CalculateSplit: SplitEngine (Equal / SqFt / Custom)
    CalculateSplit --> GenerateUPI: PaymentLink Tool (upi://pay + QR)
    GenerateUPI --> AnnounceStage1: Stage 1 Friendly Notice Dispatched
    
    AnnounceStage1 --> MonitorBackground: Status = PENDING
    
    state MonitorBackground {
        [*] --> CloudSchedulerPulse: Hourly / Daily Cron Trigger
        CloudSchedulerPulse --> CheckDueDates: Unattended Background Scan
        CheckDueDates --> EvaluateTone: Calculate Delta vs DueDate
        EvaluateTone --> DispatchNudge: Stage 2 (3d Before Due Date)
        EvaluateTone --> DispatchDeadline: Stage 3 (Due Date Today)
        EvaluateTone --> DispatchOverdueFlag: Stage 4 (Overdue Alert to Group)
        DispatchNudge --> [*]
        DispatchDeadline --> [*]
        DispatchOverdueFlag --> [*]
    }
    
    MonitorBackground --> PaymentConfirmed: Roommate Taps UPI Link & Confirms
    PaymentConfirmed --> UpdateMemoryBank: Record Payment Velocity in Firestore
    UpdateMemoryBank --> CheckMonthEnd: Status = SETTLED
    
    CheckMonthEnd --> RunDebtSimplification: Month-End Settlement Trigger
    RunDebtSimplification --> [*]: Min-Cash-Flow Simplification (6 IOUs -> 2 Transfers)
```

---

## 👥 3-Developer Feature-Driven Development (FDD) Work Breakdown

To ensure **zero merge conflicts** and parallel velocity, the project is partitioned into strict ownership domains:

```mermaid
graph TD
    T01["[DEV 1] T-01: Shared API Contract, Types & Mock Fixtures"] --> T02["[DEV 1] T-02: Gemini Vision Receipt Parser"]
    T01 --> T03["[DEV 1] T-03: Split Engine & Math Invariants"]
    T01 --> T04["[DEV 1] T-04: Min-Cash-Flow Debt Simplifier"]
    T01 --> T05["[DEV 2] T-05: Next.js Layout & Glassmorphism Design System"]
    
    T02 & T05 --> T06["[DEV 2] T-06: Receipt Dropzone & Extraction Drawer UI"]
    T03 --> T07["[DEV 1] T-07: UPI Deep Link & QR Code Generator"]
    T04 & T05 --> T08["[DEV 2] T-08: Interactive Debt Network Graph Visualizer"]
    T07 & T05 --> T09["[DEV 2] T-09: One-Tap UPI Payment Modal UI"]
    
    T03 & T07 --> T10["[DEV 1] T-10: 4-Stage Autonomous Tone Escalation Engine"]
    T10 & T05 --> T11["[DEV 2] T-11: Live Agent Activity Stream UI"]
    T10 --> T12["[DEV 1] T-12: Time-Travel Fast-Forward Simulator & Pulse Webhooks"]
    
    T06 & T08 & T09 & T11 & T12 --> T13["[DEV 1] T-13: Cloud Run Deployment & E2E Validation"]
    T13 --> T14["[DEV 3] T-14: Auxiliary Sample Receipt Assets & Slide Deck (Non-blocking)"]
```

| Developer | Role & Domain | Assigned Components | Workload |
|---|---|---|---|
| **Dev 1** | **Lead Backend, AI & Integration** (`backend/`, `shared/`, `cloud/`) | Gemini Vision Tools, Split Calculator, Debt Simplifier, Tone Escalation Engine, Firestore Memory Bank, FastAPI Routes, Time-Travel Simulator, Cloud Run Dockerfile. | **70%** |
| **Dev 2** | **Frontend & Multimodal UX** (`frontend/`) | Next.js 14 Dashboard, Cyber-Financial Glassmorphism Theme, Receipt Dropzone, Debt Graph Visualizer, Agent Activity Stream, Payment Modals. | **25%** |
| **Dev 3** | **Auxiliary Assets (Deferred / Non-blocking)** (`docs/assets/`) | High-res sample bill image pack, presentation slide deck polish. *Core app has 0% dependency on Dev 3.* | **5%** |

---

## 🚀 Quickstart & Spin-up Instructions

### Prerequisites
- **Node.js** v18+ & `npm`
- **Python** 3.11+
- *(Optional for Live Cloud Mode)*: `GEMINI_API_KEY` and Google Cloud Project credentials.

---

### Step 1: Clone & Configure Environment
```bash
git clone https://github.com/your-org/roomieops-ai.git
cd roomieops-ai

# Copy environment template
cp backend/.env.example backend/.env
```

*Note: RoomieOps features a **Dual Storage Adapter & Mock Engine**. If no Gemini key or Firestore project is provided, it runs locally in sandbox mode with built-in realistic mock datasets.*

---

### Step 2: Spin Up Backend (FastAPI + Agent Core)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000` (Interactive docs at `http://localhost:8000/docs`).

---

### Step 3: Spin Up Frontend (Next.js 14 Glassmorphism Dashboard)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Dashboard will be live at: `http://localhost:3000`.

---

### Step 4: Run Automated Tests
```bash
cd backend
pytest tests/ -v
```

---

## ☁️ Google Cloud Deployment Guide

### Deploying Backend to Google Cloud Run
```bash
# Set your GCP Project
gcloud config set project YOUR_PROJECT_ID

# Build & Deploy Container to Cloud Run
gcloud run deploy roomieops-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY},FIRESTORE_PROJECT_ID=YOUR_PROJECT_ID"
```

### Configuring Google Cloud Scheduler (Hourly Cron Pulse)
```bash
gcloud scheduler jobs create http roomieops-hourly-pulse \
  --location us-central1 \
  --schedule "0 * * * *" \
  --uri "https://YOUR_CLOUD_RUN_URL/api/agent/pulse" \
  --http-method POST
```

---

## 📊 Feature Comparison: RoomieOps vs. Splitwise

| Feature | Splitwise / Traditional Apps | RoomieOps AI |
|---|---|---|
| **Receipt Entry** | ❌ Manual typing of amounts & categories | ✅ **Gemini Multimodal Vision** (photo/PDF) |
| **Split Mathematics** | ⚠️ Basic 50/50 or manual shares | ✅ **Automated SqFt, Custom %, Itemized** |
| **Payment Link Generation** | ❌ None (or static profile link) | ✅ **Dynamic `upi://pay` Deep Links & QR** |
| **Payment Reminders** | ❌ 100% manual (a human must tap nag) | ✅ **100% Autonomous 4-Stage Tone Escalation** |
| **Background Cron Monitoring** | ❌ None (App is passive) | ✅ **Cloud Scheduler + Pub/Sub Scheduled Scans** |
| **Debt Simplification** | ⚠️ Behind paywall / basic | ✅ **Greedy Min-Cash-Flow Graph Solver** |
| **Behavioral Memory** | ❌ None (Treats every month as blank) | ✅ **Firestore Payment Velocity & Habit Badges** |

---

## 📐 Mathematical Proof: Debt Simplification Bound

RoomieOps uses a **Greedy Min-Cash-Flow Algorithm** to reduce pairwise debts.  
For any household of $N$ roommates with up to $\binom{N}{2}$ mutual debts, our algorithm:
1. Calculates net balance $\text{Net}_i = \sum \text{Credits}_i - \sum \text{Debits}_i$.
2. Matches the largest debtor with the largest creditor iteratively.
3. **Guarantees that at most $N - 1$ total settlement transactions are required** while maintaining exact net cash conservation ($\sum \text{Net}_i \equiv 0$).

---

## 📁 Repository Structure

```
roommate-ops/
├── shared/                     # Single Source of Truth API Contract & Types
│   ├── schema.py               # Pydantic models for Python Backend
│   ├── types.ts                # TypeScript interfaces for Frontend
│   └── mock_data/              # Seed fixtures (Households, Bills, Roommates)
├── backend/                    # Python FastAPI & Google Agent Core
│   ├── app/
│   │   ├── agent/tools/        # parse_receipt, calculate_split, simplify_debts, etc.
│   │   ├── services/           # firestore_service, gemini_service, memory_bank
│   │   ├── api/                # REST endpoints (/expenses, /payments, /agent/pulse)
│   │   └── main.py
│   ├── tests/                  # Pytest unit tests for tools & graph algorithms
│   └── requirements.txt
├── frontend/                   # Next.js 14 Web Application
│   ├── src/
│   │   ├── components/         # ReceiptDropzone, DebtGraph, ActivityStream, PaymentModal
│   │   ├── app/                # App Router layout, pages, and themes
│   │   └── styles/             # Cyber-financial glassmorphism CSS tokens
│   └── package.json
├── cloud/                      # Google Cloud Deployment Assets
│   ├── Dockerfile              # Production Cloud Run container
│   ├── deploy.sh               # One-click deployment script
│   └── scheduler_setup.sh      # Cloud Scheduler cron setup
├── docs/                       # Complete 25-Document Hackathon Architecture Suite
│   ├── 01-prd.md
│   ├── 02-architecture.md
│   ├── 16-demo-script-4min-video-pitch.md
│   ├── architecture_preview.html
│   └── design_system_preview.html
└── README.md
```

---

## 👥 Hackathon Team & Devpost Submission
- **Hackathon:** Google All Things Agentic Hackathon 2026
- **Track:** The Taskmaster
- **Demo Video:** *4-Minute Pitch Walkthrough* ([Script in docs/16-demo-script-4min-video-pitch.md](docs/16-demo-script-4min-video-pitch.md))
- **Live Cloud Run URL:** `https://roomieops-agent-uc.a.run.app`
