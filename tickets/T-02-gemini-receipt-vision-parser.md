# Ticket T-02: Gemini Multimodal Vision Receipt Parser Tool

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `backend/app/agent/tools/`
- **Dependencies**: `T-01`
- **Status**: Completed

---

## Objective
Implement the `parse_receipt` tool utilizing Gemini 2.5 / 3.5 Multimodal vision to extract structured financial data from uploaded bill images or PDFs.

## Target Files
- `backend/app/agent/tools/receipt_parser.py`
- `backend/tests/test_receipt_parser.py`

## Acceptance Criteria
- [x] Extracts vendor name, category, total amount, taxes, bill date, due date, and line items.
- [x] Returns validated `ParsedExpense` Pydantic model.
- [x] Includes graceful deterministic fallback if `GEMINI_API_KEY` is not present or offline.
