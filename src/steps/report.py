"""Step: report — summarize the run and show progress toward the daily goal."""
from __future__ import annotations

from typing import Any

from src.engine import register
from src import config, state


@register("report")
def report(context: dict[str, Any]) -> dict[str, Any]:
    goal = config.daily_goal()
    today = state.earned_today()
    pending = sum(1 for q in state.load()["queue"] if q["status"] == "pending")

    bar_len = 20
    filled = min(bar_len, int((today / goal) * bar_len)) if goal else 0
    bar = "█" * filled + "░" * (bar_len - filled)

    print("   ──────────── Daily summary ────────────")
    print(f"   New proposals queued : {context.get('queued', 0)}")
    print(f"   Pending review total : {pending}")
    print(f"   Earned today         : ${today:.2f} / ${goal:.2f}")
    print(f"   Goal progress        : [{bar}] {min(100, int(today/goal*100)) if goal else 0}%")
    if today < goal:
        print(f"   → Approve proposals (python -m src.cli review), then apply on-platform.")
    else:
        print("   🎉 Daily goal reached!")
    print("   ────────────────────────────────────────")
    return context
