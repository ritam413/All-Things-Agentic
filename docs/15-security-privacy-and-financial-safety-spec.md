# 15 - Security, Privacy & Financial Safety Specification

## 1. Zero-Custody Architectural Invariant
RoomieOps AI is designed with a **Zero-Custody Principle**:
- The application **NEVER** holds, escrows, transfers, or touches user funds directly.
- All monetary transfers occur peer-to-peer over the user's native banking/UPI application (Google Pay, PhonePe, Paytm, BHIM) using client-side deep links.
- No bank login credentials, UPI PINs, credit card numbers, or CVVs are collected, processed, or stored.

---

## 2. PII Protection & Data Sanitization
1. **Receipt Image Sanitization**:
   - Ingested receipt images are processed transiently in memory for OCR extraction.
   - PII such as personal bank account numbers on utility bills is redacted before long-term storage in Firestore.
2. **Contact Channel Privacy**:
   - Roommate phone numbers and email addresses are restricted to household members.

---

## 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated household members can read and update household data
    match /households/{householdId} {
      allow read, write: if request.auth != null;
      
      match /expenses/{expenseId} {
        allow read, write: if request.auth != null;
      }
      
      match /activity_logs/{logId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null; // Immutable append-only in production
      }
      
      match /memory_bank/{roommateId} {
        allow read: if request.auth != null;
      }
    }
  }
}
```
