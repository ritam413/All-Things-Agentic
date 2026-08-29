# Ticket T-06: Receipt Dropzone & Live Review Drawer UI

- **Assignee**: **Dev 2** (Frontend & Multimodal UX Specialist)
- **Domain**: `frontend/src/components/`
- **Dependencies**: `T-02`, `T-05`
- **Status**: Ready

---

## Objective
Build the drag-and-drop receipt ingestion component with live Gemini extraction review and one-click preset buttons.

## Target Files
- `frontend/src/components/ReceiptDropzone.tsx`
- `frontend/src/services/api.ts`

## Acceptance Criteria
- [ ] Drag-and-drop file upload supporting image formats and PDFs.
- [ ] Split rule toggles (Equal 50/50, By Room Size, Custom %).
- [ ] One-click preset bill buttons (Electricity ₹2,450, Wifi ₹1,199, Groceries ₹3,280, Rent ₹60,000).
- [ ] Loading state with visual pulse animation during Gemini extraction.
