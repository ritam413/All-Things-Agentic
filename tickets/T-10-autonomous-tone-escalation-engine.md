# Ticket T-10: 4-Stage Autonomous Tone Escalation Engine

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `backend/app/agent/tools/`
- **Dependencies**: `T-01`, `T-03`
- **Status**: Completed

---

## Objective
Implement the autonomous due-date monitor that evaluates unpaid balances and progresses through 4 adaptive tones.

## Target Files
- `backend/app/agent/tools/escalation_engine.py`
- `backend/tests/test_escalation_engine.py`
- `backend/tests/test_core_tools.py`

## Acceptance Criteria
- [x] Implements 4 stages: `STAGE_1_ANNOUNCE`, `STAGE_2_NUDGE`, `STAGE_3_DEADLINE`, `STAGE_4_OVERDUE`.
- [x] Generates contextual messages containing the payee name, amount, and UPI link.
- [x] Returns immutable `AgentActivityLog` entries with corresponding severity levels.
