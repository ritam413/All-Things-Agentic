"""
Debt Simplifier Deep Module: Min-Cash-Flow Graph Algorithm.
Reduces N mutual household IOUs down to at most N-1 optimal transactions.
Invariants:
- Preserves net cash balances: sum(Net_before) == sum(Net_after) == 0
- Eliminates circular debt loops (e.g. A -> B -> C -> A)
"""

import sys
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import heapq

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import (
    RawDebt,
    Settlement,
    DebtSimplificationResult,
    Roommate,
)
from backend.app.agent.tools.payment_links import generate_upi_deep_link, generate_qr_base64


def simplify_household_debts(
    raw_debts: List[RawDebt],
    roommates_map: Optional[Dict[str, Roommate]] = None,
) -> DebtSimplificationResult:
    """
    Solves the Min-Cash-Flow bipartite matching problem.
    """
    if not raw_debts:
        return DebtSimplificationResult(
            raw_debts_count=0,
            simplified_transfers_count=0,
            total_volume_cleared=0.0,
            settlements=[],
        )

    # 1. Compute Net Balances in cents to eliminate floating-point rounding errors
    net_balances: Dict[str, int] = {}
    names_map: Dict[str, str] = {}
    valid_raw_debts_count = 0

    for debt in raw_debts:
        if debt.debtor_id == debt.creditor_id or debt.amount <= 0:
            continue
        valid_raw_debts_count += 1
        cents = int(round(debt.amount * 100))
        net_balances[debt.creditor_id] = net_balances.get(debt.creditor_id, 0) + cents
        net_balances[debt.debtor_id] = net_balances.get(debt.debtor_id, 0) - cents
        
        names_map[debt.creditor_id] = debt.creditor_name
        names_map[debt.debtor_id] = debt.debtor_name

    # 2. Partition into Debtors (negative balance) and Creditors (positive balance)
    # Use max-heaps (simulated with negative numbers for min-heap)
    debtor_heap: List[Tuple[int, str]] = []  # (-amount_owed, debtor_id)
    creditor_heap: List[Tuple[int, str]] = []  # (-amount_owed, creditor_id)

    for person_id, balance in net_balances.items():
        if balance < 0:
            heapq.heappush(debtor_heap, (balance, person_id))  # balance is negative
        elif balance > 0:
            heapq.heappush(creditor_heap, (-balance, person_id))

    settlements: List[Settlement] = []
    total_volume_cleared = 0.0

    # 3. Greedy matching loop
    while debtor_heap and creditor_heap:
        debtor_neg_bal, debtor_id = heapq.heappop(debtor_heap)
        creditor_neg_bal, creditor_id = heapq.heappop(creditor_heap)

        debtor_amount = -debtor_neg_bal
        creditor_amount = -creditor_neg_bal

        transfer_cents = min(debtor_amount, creditor_amount)
        transfer_amount = transfer_cents / 100.0
        total_volume_cleared += transfer_amount

        creditor_name = names_map.get(creditor_id, creditor_id)
        debtor_name = names_map.get(debtor_id, debtor_id)

        # Lookup payee UPI VPA if available
        payee_vpa = "payee@upi"
        if roommates_map and creditor_id in roommates_map:
            payee_vpa = roommates_map[creditor_id].upi_vpa

        upi_link = generate_upi_deep_link(
            payee_vpa=payee_vpa,
            payee_name=creditor_name,
            amount=transfer_amount,
            transaction_note=f"RoomieOps Settlement to {creditor_name}",
        )
        qr_code = generate_qr_base64(upi_link)

        settlement = Settlement(
            from_roommate_id=debtor_id,
            from_roommate_name=debtor_name,
            to_roommate_id=creditor_id,
            to_roommate_name=creditor_name,
            amount=transfer_amount,
            upi_deep_link=upi_link,
            qr_code_base64=qr_code,
        )
        settlements.append(settlement)

        # Re-queue remaining balances if any
        remaining_debtor = debtor_amount - transfer_cents
        remaining_creditor = creditor_amount - transfer_cents

        if remaining_debtor > 0:
            heapq.heappush(debtor_heap, (-remaining_debtor, debtor_id))
        if remaining_creditor > 0:
            heapq.heappush(creditor_heap, (-remaining_creditor, creditor_id))

    return DebtSimplificationResult(
        raw_debts_count=len(raw_debts),
        simplified_transfers_count=len(settlements),
        total_volume_cleared=round(total_volume_cleared, 2),
        settlements=settlements,
    )
