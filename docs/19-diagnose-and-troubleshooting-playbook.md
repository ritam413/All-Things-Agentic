# 19 - Diagnose & Troubleshooting Playbook

This runbook provides immediate remediation steps for common issues encountered during local development, demo recording, and Google Cloud deployment.

---

## 1. Gemini API / Multimodal Vision Errors

### Issue: `429 ResourceExhausted / Rate Limit Exceeded`
- **Cause**: Exceeded Gemini free-tier quota on consecutive uploads.
- **Fix**: The backend automatically falls back to local sample fixtures (`shared/mock_data/`) when `MOCK_GEMINI=true` or when a 429 response is caught.
- **Remediation**: Set `export MOCK_GEMINI=true` in `backend/.env` for zero-latency local development.

### Issue: `400 Invalid Argument / Malformed JSON Output`
- **Cause**: LLM returned conversational wrapper or non-strict JSON.
- **Fix**: Verify that `backend/app/agent/tools/receipt_parser.py` uses `response_mime_type="application/json"` and Pydantic schema enforcement via Google GenAI SDK.

---

## 2. Google Cloud Firestore & Dual Adapter Issues

### Issue: `DefaultCredentialsError / Could not automatically determine credentials`
- **Cause**: Missing `GOOGLE_APPLICATION_CREDENTIALS` on local machine.
- **Fix**: RoomieOps defaults to `InMemoryAdapter` when GCP credentials are not found. No crash will occur. To enable live cloud Firestore, run `gcloud auth application-default login`.

---

## 3. CORS & Next.js Frontend Connection Errors

### Issue: `CORS policy: No 'Access-Control-Allow-Origin' header`
- **Cause**: Frontend on `http://localhost:3000` attempting requests to FastAPI on `http://localhost:8000`.
- **Fix**: Ensure `CORSMiddleware` in `backend/app/main.py` includes `["http://localhost:3000", "http://127.0.0.1:3000"]` and `allow_credentials=True`.
