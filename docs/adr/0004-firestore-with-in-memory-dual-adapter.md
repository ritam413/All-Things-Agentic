# ADR 0004: Dual-Mode Firestore Adapter with In-Memory Fallback

## Status
Accepted

## Context
The hackathon scoring criteria requires proof of deployment and state persistence on **Google Cloud Firestore**. However, judges running the repository locally or offline reviewers may lack immediate GCP service account credentials or Firestore emulator configuration.

## Decision
We implement a **Dual Storage Adapter** behind the `StorageRepository` seam:
1. `FirestoreAdapter`: Connects directly to Google Cloud Firestore using `google-cloud-firestore` for cloud execution on Cloud Run.
2. `InMemoryAdapter`: Emulates the exact same document collections (`households`, `bills`, `roommates`, `activity_logs`, `memory_bank`) with automatic initial seeding.
3. The adapter dynamically switches based on whether `GOOGLE_APPLICATION_CREDENTIALS` / `FIRESTORE_PROJECT_ID` is present in the environment.

## Consequences
- **Positive**: 100% cloud-ready for Google Cloud Run deployment.
- **Positive**: Zero-config instant local boot (`uvicorn app.main:app`) for frictionless local evaluation and automated CI/test suites.
- **Negative**: In-memory state resets upon server restart in local mode unless saved to a mock JSON cache.
