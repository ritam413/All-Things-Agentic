# Ticket T-15: Shared Contracts & Schemas for Auth, Multi-Group & Settlement Status

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `shared/`
- **Dependencies**: None (Frontier Ticket for feat/account_groups)
- **Status**: Completed

---

## Objective
Extend domain schemas and TypeScript definitions to support User Profiles, Authentication, Multi-Household/Group Management, and the "Who Has Paid vs Who Is Left" settlement status matrix.

## Target Files
- `shared/schema.py` (Pydantic domain models)
- `shared/types.ts` (TypeScript interfaces)
- `shared/mock_data/household_seed.json` (Seed updates for multi-household support)

## Acceptance Criteria
- [x] Pydantic & TypeScript definitions for `User`, `AuthToken`, `UserRegisterRequest`, `UserLoginRequest`, `UserProfileUpdateRequest`.
- [x] Pydantic & TypeScript definitions for `CreateHouseholdRequest`, `AddMemberRequest`, `UpdateMemberRequest`.
- [x] Pydantic & TypeScript definitions for `HouseholdSettlementStatus`, `MemberPaymentSummary`, `BillShareStatusSummary`.
- [x] 100% type parity between Python Pydantic models and TypeScript interfaces.

