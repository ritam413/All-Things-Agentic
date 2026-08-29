#!/usr/bin/env bash
set -e

PROJECT_ID="${GCP_PROJECT_ID:-roomieops-agentic-hackathon}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="roomieops-backend"
JOB_NAME="roomieops-hourly-pulse"

echo "==> Fetching Cloud Run Service URL..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')

if [ -z "$SERVICE_URL" ]; then
  echo "Error: Cloud Run service $SERVICE_NAME not found in $REGION."
  exit 1
fi

PULSE_ENDPOINT="${SERVICE_URL}/api/agent/pulse"

echo "==> Configuring Google Cloud Scheduler Cron..."
echo "Cron Schedule: Hourly (0 * * * *)"
echo "Target URL:    $PULSE_ENDPOINT"

# Delete old job if exists
gcloud scheduler jobs delete "$JOB_NAME" --location "$REGION" --quiet || true

# Create hourly HTTP trigger
gcloud scheduler jobs create http "$JOB_NAME" \
  --location "$REGION" \
  --schedule "0 * * * *" \
  --uri "$PULSE_ENDPOINT" \
  --http-method POST \
  --description "Autonomous hourly due-date scan and tone escalation pulse for RoomieOps AI."

echo "==> Cloud Scheduler Job '$JOB_NAME' active!"
