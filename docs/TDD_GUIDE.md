# Test-Driven Development (TDD) Guide: RoomieOps AI

This guide establishes the TDD conventions, testing seams, public interface specifications, and fixtures for **RoomieOps AI** following the `tdd` skill principles.

---

## 1. Core TDD Principles & Seams

1. **Tests Live at Seams**: Tests assert behavior through public interfaces only (`backend/app/agent/tools/` and API routes), never against internal helper functions or private state.
2. **Red $\rightarrow$ Green $\rightarrow$ Refactor**:
   - **Red**: Write a failing test in `backend/tests/` that specifies the desired behavior.
   - **Green**: Write the minimal implementation code to pass the test.
   - **Refactor**: Clean up the implementation while keeping the public interface unchanged.
3. **No Mocking of Domain Logic**: Pure algorithms (Split calculation, Min-Cash-Flow graph reduction, Tone escalation rules) are tested with real inputs and exact assertions. Mocking is restricted to external I/O boundaries (Gemini API network calls, Twilio SMS dispatch).

---

## 2. Test Specifications by Module Seam

### Test Suite 1: `test_split_calculator.py`
- **Seam**: `calculate_shares(expense: Expense, household: Household) -> List[SplitShare]`
- **Test Cases**:
  - `test_equal_split_even_division`: $120.00 among 3 roommates $\rightarrow$ exactly $40.00 each.
  - `test_equal_split_penny_rounding`: $100.00 among 3 roommates $\rightarrow$ $33.34, $33.33, $33.33 (sum strictly equals $100.00).
  - `test_room_area_weighted_split`: Total $1000 rent. Room sizes: 200 sqft, 300 sqft, 500 sqft $\rightarrow$ shares: $200.00, $300.00, $500.00.
  - `test_exclusion_split`: Grocery bill with milk and snacks, where Roommate C is excluded from dairy $\rightarrow$ computes correct adjusted subsets.

### Test Suite 2: `test_debt_simplifier.py`
- **Seam**: `simplify_household_debts(raw_debts: List[RawDebt]) -> List[Settlement]`
- **Test Cases**:
  - `test_direct_pairwise_iou`: Alice owes Bob $50 $\rightarrow$ 1 settlement: Alice pays Bob $50.
  - `test_circular_debt_cancellation`: Alice owes Bob $30, Bob owes Charlie $30, Charlie owes Alice $30 $\rightarrow$ 0 settlements (net zero).
  - `test_complex_network_compression`: 4 roommates with 6 raw mutual debts $\rightarrow$ guaranteed $\le 3$ optimal settlements with identical net balances.
  - `test_net_balance_conservation`: Mathematical invariant: $\sum_{\text{before}} \text{Net}_i \equiv \sum_{\text{after}} \text{Net}_i \equiv 0$.

### Test Suite 3: `test_payment_links.py`
- **Seam**: `create_payment_intent(payee_vpa: str, payee_name: str, amount: float, note: str) -> PaymentIntent`
- **Test Cases**:
  - `test_upi_uri_format`: Generates valid URI starting with `upi://pay?pa=...&pn=...&am=...&tn=...&cu=INR`.
  - `test_qr_code_base64_generation`: Returns valid base64 PNG string that decodes to the exact UPI URI.

### Test Suite 4: `test_escalation_engine.py`
- **Seam**: `process_autonomous_pulse(household_id: str, simulated_now: datetime) -> EscalationReport`
- **Test Cases**:
  - `test_stage_1_announce_on_creation`: Returns friendly tone template on creation day.
  - `test_stage_2_nudge_3_days_before_due`: When `now = DueDate - 3d`, returns gentle nudge.
  - `test_stage_3_deadline_on_due_date`: When `now = DueDate`, returns firm actionable reminder.
  - `test_stage_4_overdue_escalation`: When `now = DueDate + 2d`, returns urgent escalation and logs household transparency alert.
  - `test_settled_bills_are_skipped`: Paid bills produce 0 escalation actions.

### Test Suite 5: `test_memory_bank.py`
- **Seam**: `update_habit_profile(roommate_id: str, bill_id: str, payment_timestamp: datetime) -> HabitProfile`
- **Test Cases**:
  - `test_payment_velocity_average`: Records settlement times and calculates running average hours.
  - `test_chronic_late_payer_badge`: 3 consecutive overdue settlements trigger `⚠️ Chronic Late Payer` badge.
  - `test_rapid_settler_badge`: Settlements under 2 hours trigger `⚡ Rapid Settler` badge.

---

## 3. Running the Test Suite
```bash
# Run all backend unit tests
cd backend
pytest tests/ -v

# Run with coverage report
pytest --cov=app tests/
```
