# Ticket T-12: Time-Travel Fast-Forward Simulator & Pulse Webhooks

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `backend/app/api/`
- **Dependencies**: `T-10`
- **Status**: Completed

---

## Objective
Implement the backend endpoints for periodic cron pulses and the demo time-travel simulator.

## Target Files
- `backend/app/api/routes.py`
- `backend/app/main.py`
- `backend/tests/test_api_routes.py`

## Acceptance Criteria
- [x] `POST /api/agent/pulse`: Triggers due-date scan and returns activity log.
- [x] `POST /api/agent/simulate-days`: Advances simulated date by $N$ days and runs escalation pulse.
- [x] `GET /api/agent/activity`: Returns latest 30 audit logs.

