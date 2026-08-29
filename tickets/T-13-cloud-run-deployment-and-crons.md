# Ticket T-13: Google Cloud Run Deployment & Cloud Scheduler Setup

- **Assignee**: **Dev 1** (Lead AI & Backend Engine)
- **Domain**: `cloud/` & root `Dockerfile`
- **Dependencies**: `T-01` through `T-12`
- **Status**: Completed

---

## Objective
Containerize the application with Docker and provide automated deployment scripts for Google Cloud Run and Cloud Scheduler.

## Target Files
- `cloud/Dockerfile` & `Dockerfile`
- `cloud/deploy.sh`
- `cloud/scheduler_setup.sh`

## Acceptance Criteria
- [x] Multi-stage lightweight Python 3.11 Docker container built for Cloud Run.
- [x] `cloud/deploy.sh` script deploying backend with environment variable injection.
- [x] `cloud/scheduler_setup.sh` creating an hourly HTTP cron job pointing to `/api/agent/pulse`.

