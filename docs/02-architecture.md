# 02 - Architecture & Deep Module System Design

## Deep Module Philosophy & Decoupled Architecture
**Philosophy:** In accordance with modern software architecture principles (John Ousterhout, *A Philosophy of Software Design*), RoomieOps AI is architected using **Deep Modules**: modules that provide powerful, complex functionality behind small, simple, and clean interfaces. Shallow modules (which add boilerplate without hiding complexity) and tight coupling across boundaries are strictly prohibited.

---

## 1. High-Level Architectural Topology

```mermaid
flowchart TB
    subgraph ClientLayer["Layer 1: Client Dashboard (Next.js 14 / Glassmorphism)"]
        direction TB
        UI_Drop["Receipt Ingestion Dropzone<br/>(Live Gemini Extraction Preview)"]
        UI_Ledger["Expense Ledger & Split Manager"]
        UI_Graph["Interactive Debt Network Graph<br/>(Before vs After Simplification)"]
        UI_Stream["Real-Time Agent Activity & Audit Feed"]
        UI_PayModal["One-Tap UPI QR & Deep Link Modal"]
        UI_TimeTravel["Time-Travel Simulator Slider (+3d, +7d)"]
    end

    subgraph GatewayLayer["Layer 2: API Gateway & Integration (FastAPI / Cloud Run)"]
        direction TB
        API_Route["REST API Controllers<br/>(Strictly Typed via shared/openapi.json)"]
        API_Webhook["Payment Confirmation & Time Pulse Webhooks"]
    end

    subgraph AgentCoreLayer["Layer 3: Autonomous Agent Core (Google ADK / GenAI SDK)"]
        direction TB
        Agent_Controller["Autonomous Agent Orchestrator"]
        
        Tool_Vision["parse_receipt()<br/>Gemini Multimodal Vision"]
        Tool_Split["calculate_split()<br/>Equal / SqFt / Custom %"]
        Tool_UPI["generate_payment_link()<br/>UPI Deep Links & QR"]
        Tool_Graph["simplify_debts()<br/>Min-Cash-Flow Solver"]
        Tool_Tone["escalate_reminders()<br/>4-Stage Adaptive Tone Engine"]
        Tool_Memory["memory_bank()<br/>Behavioral Profile & Analytics"]
        
        Agent_Controller --> Tool_Vision
        Agent_Controller --> Tool_Split
        Agent_Controller --> Tool_UPI
        Agent_Controller --> Tool_Graph
        Agent_Controller --> Tool_Tone
        Agent_Controller --> Tool_Memory
    end

    subgraph GoogleCloudLayer["Layer 4: Google Cloud Infrastructure"]
        direction TB
        GCP_Gemini["Gemini 2.5 / 3.5 Flash<br/>(Structured Vision & LLM Engine)"]
        GCP_Firestore[("Google Cloud Firestore<br/>(Households, Expenses, Logs, Memory)")]
        GCP_Scheduler["Google Cloud Scheduler<br/>(Hourly/Daily Cron Trigger)"]
        GCP_PubSub["Cloud Pub/Sub<br/>(Topic: rentops-cron)"]
        
        GCP_Scheduler -->|Periodic Heartbeat| GCP_PubSub
        GCP_PubSub -->|Push Subscription| API_Webhook
        Tool_Vision <-->|Multimodal Schema| GCP_Gemini
        Agent_Controller <-->|Read / Write State| GCP_Firestore
    end

    ClientLayer <-->|REST API / SSE| GatewayLayer
    GatewayLayer <--> AgentCoreLayer
```

---

## 2. Developer Domain Seams & Zero-Conflict Matrix

| Module / Seam | Primary Owner | Public Interface (Seam) | External Dependencies (Adapters) |
|---|---|---|---|
| `ReceiptParser` | Dev 1 (Backend) | `parse_receipt(bytes, mime) -> ParsedExpense` | `GeminiVisionAdapter`, `MockReceiptAdapter` |
| `SplitEngine` | Dev 1 (Backend) | `calculate_shares(expense, household) -> List[SplitShare]` | Pure Domain Invariant (Zero I/O) |
| `DebtSimplifier` | Dev 1 (Backend) | `simplify_household_debts(raw_debts) -> List[Settlement]` | Min-Cash-Flow Solver (Pure Graph Math) |
| `PaymentLinkEngine` | Dev 1 (Backend) | `create_payment_intent(payee, amount, note) -> PaymentIntent` | `QRCodeAdapter`, `UPIDeepLinkFormatter` |
| `EscalationEngine` | Dev 1 (Backend) | `process_autonomous_pulse(household_id, now) -> EscalationReport` | `AgentActivityLogger`, `NotificationAdapter` |
| `MemoryBank` | Dev 1 (Backend) | `update_habit_profile(roommate_id, bill_id, time) -> HabitProfile` | `FirestoreAdapter`, `InMemoryAdapter` |
| `APIGateway & Webhooks` | Dev 2 (Integration) | REST Routes defined in `shared/openapi.json` | FastAPI, Pydantic, Uvicorn |
| `Cloud Deployment & Crons` | Dev 2 (Integration) | Cloud Run Dockerfile, Cloud Scheduler, Pub/Sub | GCP Artifact Registry, gcloud CLI |
| `Dashboard & Visualizers` | Dev 3 (Frontend) | Next.js 14 App Router, TailwindCSS, Lucide Icons | Axios Client typed via `shared/types.ts` |

---

## 3. The 3-Tier Adapter Pattern (Locality & Testability)

Every deep module in `backend/app/agent/tools/` communicates through explicit adapters:
1. **Cloud Production Adapter**: Connects to live Google Cloud APIs (Vertex AI / Gemini API, Cloud Firestore, Cloud Pub/Sub).
2. **Local Development Adapter**: Uses local in-memory dictionaries and mock receipt generators for rapid zero-credential testing.
3. **Deterministic Test Adapter**: Hardcoded fixtures for pytest suites verifying split rounding, debt reduction, and escalation tone transitions.
