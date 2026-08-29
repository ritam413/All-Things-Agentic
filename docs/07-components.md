# 07 - Frontend Component Catalog

## Component Architecture Overview
All UI components are built in Next.js 14 / React using **Vanilla TailwindCSS** and custom glassmorphism design tokens defined in `docs/09-design-systems.md`. Components import strongly-typed data structures from `shared/types.ts`.

---

## 1. Core Component Matrix

| Component Name | File Path | Props / Inputs | Key Responsibilities |
|---|---|---|---|
| `ReceiptDropzone` | `frontend/src/components/ReceiptDropzone.tsx` | `onParseComplete(data)` | Drag-and-drop file upload, image preview, sample bill preset buttons (Rent, Wifi, Groceries), loading skeleton with Gemini pulsing effect. |
| `LiveExtractionDrawer` | `frontend/src/components/LiveExtractionDrawer.tsx` | `parsedData`, `onSave(expense)` | Displays extracted vendor, amount, line items, and allows split rule selection (Equal, SqFt, %) before confirmation. |
| `DebtGraph` | `frontend/src/components/DebtGraph.tsx` | `settlements`, `rawDebts` | Interactive visual graph showing "Before (6 raw IOUs)" vs "After (2 optimized transfers)" with directional flow animations. |
| `AgentActivityStream` | `frontend/src/components/AgentActivityStream.tsx` | `logs: AgentActivityLog[]` | Real-time vertical audit feed displaying agent decisions, scheduled background scans, and tone escalations with timestamp badges. |
| `PaymentModal` | `frontend/src/components/PaymentModal.tsx` | `share: SplitShare`, `isOpen`, `onClose` | Displays dynamic UPI Deep Link button (`upi://pay`), scannable QR code, and simulated "Mark as Paid" webhook confirmation trigger. |
| `RoommateBadges` | `frontend/src/components/RoommateBadges.tsx` | `roommates: Roommate[]` | Displays roommate cards with room area, current balance, and behavioral badges (`⚡ Rapid Settler`, `⚠️ Chronic Late Payer`). |
| `TimeTravelSlider` | `frontend/src/components/TimeTravelSlider.tsx` | `onSimulate(days)` | Fast-forward slider (+1d, +3d, +7d) for live hackathon video demo, triggering immediate autonomous escalation pulses. |
| `Header` | `frontend/src/components/Header.tsx` | `agentStatus: 'IDLE' \| 'SCANNING' \| 'ESCALATING'` | Brand header, household selector, live agent pulse indicator pill, and GitHub repository links. |
