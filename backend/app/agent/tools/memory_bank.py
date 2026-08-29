"""
Memory Bank Deep Module: Long-term Behavioral Habit Profiler.
Tracks roommate payment velocity and assigns habit badges in Firestore.
"""

import sys
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.schema import HabitProfile, HabitBadge


def update_habit_profile(
    current_profile: HabitProfile,
    settled_hours: float,
    was_on_time: bool,
) -> HabitProfile:
    """
    Updates roommate habit metrics with rolling averages.
    """
    total = current_profile.total_bills_settled + 1
    # Rolling average calculation
    new_avg_hours = (
        (current_profile.avg_settlement_hours * current_profile.total_bills_settled) + settled_hours
    ) / total

    # On-time ratio
    on_time_count = (current_profile.on_time_ratio * current_profile.total_bills_settled) + (1 if was_on_time else 0)
    new_on_time_ratio = on_time_count / total

    # Consecutive late tracker
    consecutive_late = 0 if was_on_time else (current_profile.consecutive_late_count + 1)

    # Dynamic badge assignment
    if consecutive_late >= 2 or new_on_time_ratio < 0.60:
        badge = HabitBadge.CHRONIC_LATE
    elif new_avg_hours <= 4.0 and new_on_time_ratio >= 0.90:
        badge = HabitBadge.RAPID_SETTLER
    else:
        badge = HabitBadge.RELIABLE

    return HabitProfile(
        roommate_id=current_profile.roommate_id,
        roommate_name=current_profile.roommate_name,
        avg_settlement_hours=round(new_avg_hours, 1),
        on_time_ratio=round(new_on_time_ratio, 2),
        total_bills_settled=total,
        consecutive_late_count=consecutive_late,
        habit_badge=badge,
    )
