# 04 - Engineering Rules & Team Invariants

This document establishes the binding rules for the **3-Developer FDD Team** (Dev 1: Backend, Dev 2: Integration, Dev 3: Frontend). Every pull request and commit MUST satisfy these rules.

---

## 1. Zero-Conflict Directory Ownership Invariant

To guarantee that no merge conflicts occur during the hackathon build, each developer has exclusive write ownership of their designated domain:

```
[DEV 1: BACKEND]      -> backend/app/agent/tools/, backend/app/services/, backend/tests/
[DEV 2: INTEGRATION]  -> shared/, cloud/, backend/app/api/, backend/app/main.py
[DEV 3: FRONTEND]     -> frontend/src/, frontend/public/
```

- **Cross-boundary edits are strictly prohibited**:
  - Dev 1 does NOT modify API route definitions in `backend/app/api/` directly. Dev 1 provides the tool function in `backend/app/agent/tools/`.
  - Dev 3 does NOT create ad-hoc API payload structures in frontend components. Dev 3 imports types strictly from `shared/types.ts`.
  - Dev 2 updates `shared/openapi.json` and generates `shared/types.ts` whenever contracts evolve.

---

## 2. API Contract-First & Mock-First Policy

1. **Single Source of Truth (`shared/openapi.json`)**:
   No endpoint is implemented in the frontend or backend without being defined in `shared/openapi.json`.
2. **Deterministic Mock Fallbacks**:
   Frontend development MUST NOT be blocked by backend readiness. Dev 3 uses mock fixtures (`shared/mock_data/`) until Dev 2 completes integration.
3. **No Breaking Type Changes**:
   Field renames or type modifications in schemas must be coordinated and updated in `shared/` first.

---

## 3. Deep Module & Clean Code Standards

1. **Information Hiding**:
   Modules must hide their internal implementation details. A caller using `parse_receipt` must not need to know whether Gemini 2.5 or Gemini 3.5 was called, or how the prompt was structured.
2. **Pure Algorithms for Domain Logic**:
   Split calculations and debt simplification functions must be pure, deterministic functions with zero network side effects.
3. **Mathematical Invariant Conservation**:
   - $\sum_{i=1}^N \text{SplitShare}_i \equiv \text{TotalExpense}$ (Exact to the lowest currency unit/cent/paisa).
   - $\sum_{i=1}^N \text{NetBalance}_i \equiv 0$ before and after debt simplification.

---

## 4. TDD & Verification Invariants

1. **Tests Live at Seams**:
   Tests must exercise public interfaces only (`parse_receipt`, `calculate_shares`, `simplify_household_debts`, `process_autonomous_pulse`).
2. **Never Mock Domain Algorithms**:
   Do not mock `simplify_household_debts` or `calculate_shares` in tests. Mock only external I/O boundaries (Gemini API, Google Cloud Pub/Sub, Twilio/WhatsApp).
3. **Automated Test Pass Requirement**:
   All tests in `backend/tests/` must pass before marking any feature as complete in `features_implemented.md`.
