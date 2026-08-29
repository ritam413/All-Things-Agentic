"""
Split Engine Deep Module: Computes exact penny-conserved split shares.
Invariants:
- sum(shares) == total_amount (within lowest currency unit)
- Pure functional interface with zero external I/O
"""

import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
import math

# Support importing from shared/
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import (
    Roommate,
    Household,
    SplitRuleType,
    SplitShare,
    EscalationStage,
    SharePaymentStatus,
    ExpenseItem,
)


def calculate_shares(
    total_amount: float,
    split_rule: SplitRuleType,
    roommates: List[Roommate],
    expense_id: str = "exp_temp",
    payer_id: Optional[str] = None,
    items: Optional[List[Any]] = None,
) -> List[SplitShare]:
    """
    Calculates individual roommate shares with exact penny conservation.
    Supports EQUAL, ROOM_AREA, PERCENTAGE, and ITEMIZED split rules.
    """
    if not roommates or total_amount <= 0:
        return []

    n = len(roommates)
    total_cents = int(round(total_amount * 100))
    shares_cents: Dict[str, int] = {rm.id: 0 for rm in roommates}

    if split_rule == SplitRuleType.EQUAL:
        base_share = total_cents // n
        remainder = total_cents % n
        for i, rm in enumerate(roommates):
            # Distribute remainder cents to first k roommates to conserve exact total
            allocated = base_share + (1 if i < remainder else 0)
            shares_cents[rm.id] = allocated

    elif split_rule == SplitRuleType.ROOM_AREA:
        total_area = sum(rm.room_sq_ft for rm in roommates)
        if total_area <= 0:
            weights = [1.0] * n
            total_weight = float(n)
        else:
            weights = [rm.room_sq_ft for rm in roommates]
            total_weight = total_area
        
        running_sum = 0
        for i, rm in enumerate(roommates):
            if i == n - 1:
                # Last roommate gets exact remaining cents
                shares_cents[rm.id] = total_cents - running_sum
            else:
                share = int(round(total_cents * (weights[i] / total_weight)))
                shares_cents[rm.id] = share
                running_sum += share

    elif split_rule == SplitRuleType.PERCENTAGE:
        raw_pcts = [(rm.custom_split_pct if rm.custom_split_pct is not None and rm.custom_split_pct > 0 else (100.0 / n)) for rm in roommates]
        total_pct = sum(raw_pcts)
        if total_pct <= 0:
            total_pct = 100.0
            raw_pcts = [100.0 / n] * n

        running_sum = 0
        for i, rm in enumerate(roommates):
            pct = raw_pcts[i] / total_pct
            if i == n - 1:
                shares_cents[rm.id] = total_cents - running_sum
            else:
                share = int(round(total_cents * pct))
                shares_cents[rm.id] = share
                running_sum += share

    elif split_rule == SplitRuleType.ITEMIZED and items:
        # Calculate per-item shares
        running_item_total_cents = 0
        all_rm_ids = [rm.id for rm in roommates]

        for item in items:
            item_amount = getattr(item, "amount", 0.0) if not isinstance(item, dict) else item.get("amount", 0.0)
            item_cents = int(round(item_amount * 100))
            running_item_total_cents += item_cents

            # Roommates splitting this specific item
            assigned_ids = (
                getattr(item, "assigned_roommate_ids", None)
                if not isinstance(item, dict)
                else item.get("assigned_roommate_ids")
            )
            target_ids = [rid for rid in (assigned_ids or all_rm_ids) if rid in shares_cents]
            if not target_ids:
                target_ids = all_rm_ids

            m = len(target_ids)
            base_item_share = item_cents // m
            item_rem = item_cents % m
            for idx, rid in enumerate(target_ids):
                shares_cents[rid] += base_item_share + (1 if idx < item_rem else 0)

        # Distribute any difference between total_cents and itemized sum to ensure exact penny conservation
        diff = total_cents - running_item_total_cents
        if diff != 0:
            base_diff = diff // n
            rem_diff = diff % n
            for i, rm in enumerate(roommates):
                shares_cents[rm.id] += base_diff + (1 if i < rem_diff else 0)

    else:
        # Default fallback to equal
        base_share = total_cents // n
        remainder = total_cents % n
        for i, rm in enumerate(roommates):
            allocated = base_share + (1 if i < remainder else 0)
            shares_cents[rm.id] = allocated

    # Construct strongly-typed SplitShare objects
    result: List[SplitShare] = []
    for rm in roommates:
        amount = shares_cents.get(rm.id, 0) / 100.0
        # If the roommate is the payer, mark as settled / payer share
        is_payer = (rm.id == payer_id)
        share = SplitShare(
            id=f"share_{expense_id}_{rm.id}",
            expense_id=expense_id,
            roommate_id=rm.id,
            roommate_name=rm.name,
            amount_owed=amount,
            status=SharePaymentStatus.PAID if is_payer else SharePaymentStatus.UNPAID,
            escalation_stage=EscalationStage.STAGE_1_ANNOUNCE,
        )
        result.append(share)

    return result
