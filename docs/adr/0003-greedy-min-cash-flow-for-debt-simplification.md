# ADR 0003: Greedy Min-Cash-Flow Algorithm for Debt Simplification

## Status
Accepted

## Context
In a shared household with $N$ roommates, multiple overlapping bills create a dense web of pairwise IOUs (e.g. 4 roommates can create $\binom{4}{2} = 6$ raw debts: Alice owes Bob $30, Bob owes Charlie $20, Charlie owes Alice $10, etc.). Settling raw IOUs results in excessive bank transfers, confusion, and transaction friction.

## Decision
We implement a **Greedy Min-Cash-Flow Algorithm** behind the `simplify_debts` module seam:
1. Compute the **Net Balance** for each roommate: $\text{Net}_i = \sum \text{Credits}_i - \sum \text{Debits}_i$.
2. Roommates with $\text{Net} > 0$ are net creditors; roommates with $\text{Net} < 0$ are net debtors.
3. In a greedy loop, match the maximum debtor with the maximum creditor, transferring $\min(|\text{DebtorNet}|, \text{CreditorNet}|)$ and updating net balances until all balances reach zero.

## Consequences
- **Positive**: Provably guarantees a maximum of $N - 1$ total settlement transactions across the entire household.
- **Positive**: Eliminates circular debt loops ($A \rightarrow B \rightarrow C \rightarrow A$).
- **Positive**: Runs in $O(N \log N)$ time, instantaneous even for large co-living communities.
- **Negative**: Intermediary transfers: a debtor may settle directly with a creditor they didn't directly borrow from (mathematically equivalent, but visually explained in the UI).
