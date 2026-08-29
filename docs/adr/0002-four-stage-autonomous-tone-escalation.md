# ADR 0002: Four-Stage Autonomous Adaptive Tone Escalation

## Status
Accepted

## Context
A primary reason roommate expense collection fails is the social awkwardness of repeatedly asking friends for money. Passive ledgers (Splitwise) place 100% of this emotional burden on human roommates. An agentic solution must follow up autonomously without human triggering, adapting its communication style based on temporal distance from the due date.

## Decision
We implement a **4-Stage Adaptive Tone Escalation Engine** executed unattended on an hourly/daily cron schedule (via Google Cloud Scheduler + Pub/Sub):
1. **Stage 1 (Announce - Day 0)**: Friendly, cooperative announcement with one-tap payment link.
2. **Stage 2 (Nudge - Due Date - 3 Days)**: Gentle, helpful reminder highlighting upcoming deadline.
3. **Stage 3 (Deadline - Due Date)**: Direct, firm call to action emphasizing settlement today.
4. **Stage 4 (Overdue - Due Date + $K$ Days)**: Urgent notification with household transparency logging ("Notice posted to shared household feed").

## Consequences
- **Positive**: Completely depersonalizes debt collection; the agent takes the blame for nagging.
- **Positive**: Proves the 40% "Operational Utility & Autonomous Action" hackathon criteria by operating unattended.
- **Negative**: Must prevent spamming by enforcing a minimum interval (e.g. 24h) between nudges in the same stage.
