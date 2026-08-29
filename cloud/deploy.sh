#!/usr/bin/env bash
set -e

PROJECT_ID="${GCP_PROJECT_ID:-roomieops-agentic-hackathon}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="roomieops-backend"

echo "=========================================================="
echo " RoomieOps AI — Google Cloud Run Deployment Pipeline"
echo "=========================================================="
echo "Project ID : $PROJECT_ID"
echo "Region     : $REGION"
echo "Service    : $SERVICE_NAME"
echo ""

echo "==> Configuring Google Cloud Project..."
gcloud config set project "$PROJECT_ID"

echo "==> Building and Deploying Container to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY},FIRESTORE_PROJECT_ID=${PROJECT_ID}"

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')

echo ""
echo "=========================================================="
echo " ✅ DEPLOYMENT SUCCESSFUL!"
echo " Live Service URL: $SERVICE_URL"
echo " Interactive Docs: $SERVICE_URL/docs"
echo "=========================================================="
