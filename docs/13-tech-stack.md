# 13 - Complete Technology Stack Matrix

## 1. Core Technology Selection Matrix

| Tier | Technology | Purpose & Selection Rationale | Hackathon Compliance |
|---|---|---|---|
| **AI Foundation** | **Gemini 2.5 / 3.5 Flash** | Multimodal vision parsing of receipts, PDFs, and invoices with structured JSON schema constraints. | Required (Gemini 3.5 / Flash) |
| **Agent Framework** | **Google GenAI SDK / ADK** | Autonomous tool calling, reasoning loops, and schema validation. | Required (Google Agent Framework) |
| **Backend Runtime** | **Python 3.11 + FastAPI** | High-performance asynchronous API, Pydantic type validation, and Uvicorn server. | Production Standard |
| **Database & Memory** | **Google Cloud Firestore** | NoSQL document persistence for households, expenses, activity audit logs, and behavioral memory bank. | Required (Google Cloud Service) |
| **Cloud Execution** | **Google Cloud Run** | Fully managed serverless container hosting the FastAPI agent backend. | Required (Google Cloud Infrastructure) |
| **Asynchronous Crons** | **Cloud Scheduler + Pub/Sub** | Dispatches hourly/daily trigger events to execute autonomous monitoring pulses. | Required (Google Cloud Infrastructure) |
| **Frontend Framework** | **Next.js 14 (App Router)** | Server & client components, fast compilation, and seamless React state management. | Modern Web Standard |
| **Styling & Theme** | **TailwindCSS (Vanilla)** | Glassmorphism design system, CSS custom tokens, and micro-animations. | Aesthetically Rich |
| **Payment Links** | **UPI Deep Links (`upi://pay`)** | Direct one-tap mobile intent URL and client-side Base64 QR code generation. | Zero Gateway Overhead |
| **Testing Suite** | **Pytest + Pytest-Cov** | Test-driven development for mathematical graph algorithms and tool seams. | Engineering Rigor |
