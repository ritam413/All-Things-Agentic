# 14 - Debt Simplification & Financial Graph Theory

## 1. Problem Formulation (Mutual Debt Tangling)
In a household of $N$ roommates, each expense creates pairwise directed debt edges. Over a month with $M$ bills, the debt graph $G = (V, E)$ becomes densely connected with up to $\binom{N}{2} = \frac{N(N-1)}{2}$ raw debt edges.

Raw debt graphs suffer from:
1. **Circular Debt Loops**: Alice owes Bob $30, Bob owes Charlie $30, Charlie owes Alice $30. Net balances are all $0, yet 3 separate bank transfers would occur naively.
2. **Transaction Bloat**: Settling every individual bill creates dozens of micro-transactions.

---

## 2. The Min-Cash-Flow Algorithm Formulation

### Step 1: Net Balance Vector Calculation
For each roommate $i \in V$, compute the net cash position:
$$\text{Net}_i = \sum_{j \in V} \text{Amount}(j \rightarrow i) - \sum_{k \in V} \text{Amount}(i \rightarrow k)$$
Where:
- $\text{Net}_i > 0 \implies$ Roommate is a **Net Creditor** (is owed money).
- $\text{Net}_i < 0 \implies$ Roommate is a **Net Debtor** (owes money).
- $\text{Net}_i = 0 \implies$ Roommate is fully settled.

**Mathematical Invariant:**
$$\sum_{i \in V} \text{Net}_i \equiv 0$$

### Step 2: Greedy Bipartite Matching
1. Separate $V$ into two sorted heaps: `Debtors` (sorted by ascending negative balance) and `Creditors` (sorted by descending positive balance).
2. While both heaps are non-empty:
   - Extract maximum debtor $D$ (owes $|Net_D|$) and maximum creditor $C$ (is owed $Net_C$).
   - Determine transfer amount: $T = \min(|Net_D|, Net_C)$.
   - Create a settlement transaction: $D \xrightarrow{T} C$.
   - Update remaining balances:
     - $Net_D \leftarrow Net_D + T$
     - $Net_C \leftarrow Net_C - T$
   - If $|Net_D| > 0$, reinsert $D$ into Debtors; if $Net_C > 0$, reinsert $C$ into Creditors.

---

## 3. Mathematical Theorem & Bound
**Theorem:** For any arbitrary debt graph with $N$ participants, the Min-Cash-Flow algorithm terminates in $O(N \log N)$ time and produces at most $N - 1$ total transactions while preserving all individual net balances.

```
Example (4 Roommates, 6 Raw IOUs -> 2 Settlements):
Raw IOUs:
  - Bob owes Alice $40
  - Charlie owes Alice $60
  - Dave owes Bob $20
  - Dave owes Charlie $30
  - Alice owes Dave $10
  - Charlie owes Bob $10

Net Balances:
  - Alice:   +$40 + $60 - $10 = +$90 (Creditor)
  - Bob:     -$40 + $20 + $10 = -$10 (Debtor)
  - Charlie: -$60 - $10 + $30 = -$40 (Debtor)
  - Dave:    -$20 - $30 + $10 = -$40 (Debtor)
  Sum of Nets: +$90 - $10 - $40 - $40 = $0

Min-Cash-Flow Settlement:
  1. Charlie pays Alice $40 (Alice net remaining: +$50)
  2. Dave pays Alice $40    (Alice net remaining: +$10)
  3. Bob pays Alice $10     (Alice net remaining: $0)
Total Transactions: 3 (Reduced from 6)
```
