# Context: Roommate Rent Ops Agent (RoomieOps AI)

## Project Overview
**RoomieOps AI** is an autonomous expense-management and debt-settlement agent built for roommates, flatmates, and shared households. Designed for Google's **All Things Agentic Hackathon** (**The Taskmaster** track), RoomieOps transforms passive ledger tracking into an active, unattended background operator:
- **Multimodal Ingestion**: Parses physical receipts, PDF utility bills, and screenshots using Gemini Multimodal.
- **Configurable Splits**: Automatically calculates shares (equal, square-footage weighted, income-adjusted, or itemized).
- **Zero-Friction Payment Requests**: Generates instant deep links (UPI `upi://pay` strings and QR codes) and delivers payment notices.
- **Autonomous Escalation Engine**: An unattended background loop (Cloud Scheduler + Pub/Sub + Cloud Run) that monitors payment status and escalates nudges (Friendly -> Firm -> Urgent -> Household Flag) as due dates approach.
- **Debt Simplification Engine**: Min-Cash-Flow graph algorithm reducing mutual pairwise IOUs to the minimum possible number of settlement transactions.
- **Long-term Household Memory Bank**: Persistent Firestore tracking payment velocity, chronic late-payment habits, and household spending patterns.

---

## Realigned 3-Developer Team Structure & Ownership

To maximize build velocity and prevent single-point-of-failure bottlenecks:

```
roommate-ops/
├── shared/                     <-- [DEV 1: LEAD BACKEND/AI/INTEGRATION] API Contract, Types, Mock Data
├── backend/                    <-- [DEV 1: LEAD BACKEND/AI/INTEGRATION] Agent Core, Tools, Gemini, DB, FastAPI Routes
├── cloud/                      <-- [DEV 1: LEAD BACKEND/AI/INTEGRATION] Cloud Run, Pub/Sub, Cloud Scheduler
├── frontend/                   <-- [DEV 2: FRONTEND & UX] Next.js Dashboard, Components, Visualizers
└── docs/assets/                <-- [DEV 3: AUXILIARY] Sample receipt image assets, presentation deck (Non-blocking)
```

### Developer Responsibilities
1. **Developer 1 (Lead Full-Stack / AI & Integration Engine)**:
   - *Domain*: `shared/`, `backend/`, `cloud/`
   - *Responsibilities*: Gemini Multimodal parser (`receipt_parser.py` with JSON sanitization and category normalization), Split algorithms (`split_calculator.py`), Min-Cash-Flow debt solver (`debt_simplifier.py`), Tone escalation rules (`escalation_engine.py`), Firestore memory bank (`firestore_service.py` decoupled repository + `memory_bank.py`), FastAPI REST endpoints (`routes.py`), Time-travel simulator, OpenAPI contracts, Cloud Run Dockerfile, Cloud Scheduler setup, unit tests.
2. **Developer 2 (Frontend & Multimodal UX Specialist)**:
   - *Domain*: `frontend/`
   - *Responsibilities*: Next.js Say Briefly design system (creative agency sketchbook on cream paper), receipt upload dropzone with live Gemini preview, interactive debt network graph, real-time agent activity audit feed, UPI QR & one-tap payment modals, time-travel fast-forward slider UI.
3. **Developer 3 (Auxiliary Assets & Demo Deck)**:
   - *Domain*: `docs/assets/`, presentation deck
   - *Responsibilities*: Static sample bill images, presentation deck polish. *Core application has 0% dependency on Dev 3.*

---

## Testing & Quality Conventions
- **Python Suite**: `python -m pytest backend/tests -v` (47 tests across contracts, core tools, receipt parser, split calculator, debt simplifier, payment links, and API routes).
- **Frontend Typecheck**: `npm run typecheck` in `frontend/` (verifies TypeScript parity against `shared/types.ts`).
- **Seams & Decoupling**: Storage repository (`firestore_service.py`) remains a pure persistence adapter; habit profiling and debt settlement logic reside in domain tools and orchestrator (`core.py`).
- **Frontend Design System & Motion Standards**: **Say Briefly** design system (`#fcfaf5` Cream Paper, `#1a3300` Forest Ink, `#ffe95c` Highlighter Yellow, and sticky-note pastels), paired with Emil Kowalski & Animate craft standards (sub-300ms transitions, custom `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, tactile button active press `scale(0.97)`, modal pop-in from `scale(0.95)`, and GPU-only transforms).
