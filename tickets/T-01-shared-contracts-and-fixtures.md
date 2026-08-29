# Ticket T-01: Shared API Contract, Schemas & Mock Fixtures

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `shared/`
- **Dependencies**: None (Frontier Ticket)
- **Status**: Completed

---

## Objective
Establish the single source of truth data contracts and seed fixtures for the entire application.

## Target Files
- `shared/schema.py` (Pydantic domain models)
- `shared/types.ts` (TypeScript interfaces)
- `shared/mock_data/household_seed.json` (4 roommates with UPI handles and room sizes)
- `shared/mock_data/sample_bills.json` (Preset bills for Electricity, Wifi, Groceries, Rent)

## Acceptance Criteria
- [x] Pydantic models defined for `Household`, `Roommate`, `Expense`, `SplitShare`, `PaymentIntent`, `Settlement`, `AgentActivityLog`, and `HabitProfile`.
- [x] TypeScript interfaces in `shared/types.ts` strictly mirror `shared/schema.py`.
- [x] Mock JSON fixtures validated and loadable by both Python and TypeScript.
