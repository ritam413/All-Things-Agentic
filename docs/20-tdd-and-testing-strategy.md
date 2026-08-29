# 20 - TDD & Testing Strategy

## 1. Test Architecture & Seams
Following the `tdd` skill, tests are designed to execute at public module seams rather than testing private implementation details.

```
backend/tests/
├── conftest.py                       (Household, Roommate, and Bill fixtures)
├── test_split_calculator.py          (Equal, SqFt, Percentage, and Penny-rounding invariants)
├── test_debt_simplifier.py           (Min-Cash-Flow graph algorithm, conservation proofs)
├── test_payment_links.py             (UPI URI string formatting & QR code validation)
├── test_escalation_engine.py         (4-Stage adaptive tone progression across time deltas)
├── test_memory_bank.py               (Payment velocity calculation & habit badge assignment)
└── test_api_routes.py                (FastAPI route contract adherence via TestClient)
```

---

## 2. Test Invariants & Assertions

```python
# Invariant 1: Split Shares Penny Conservation
def test_split_shares_sum_to_exact_total():
    expense = make_expense(total_amount=100.00)
    shares = calculate_shares(expense, 3_roommates)
    assert sum(s.amount_owed for s in shares) == 100.00

# Invariant 2: Net Debt Conservation
def test_debt_simplification_conserves_net_balances():
    raw_debts = generate_complex_debts()
    settlements = simplify_household_debts(raw_debts)
    assert calculate_net_vector(raw_debts) == calculate_net_vector(settlements)
    assert len(settlements) <= len(roommates) - 1
```
