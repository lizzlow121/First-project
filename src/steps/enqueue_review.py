"""Step: enqueue_review — add drafts to the human-approval queue.

This is the deliberate human-in-the-loop gate. Nothing is ever sent to a client
automatically — you review and approve in the CLI, then apply manually on the
platform. This keeps you compliant with platform ToS and out of spam territory.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from src.engine import register
from src import state


@register("enqueue_review")
def enqueue_review(context: dict[str, Any]) -> dict[str, Any]:
    drafts = context.get("drafts", [])
    data = state.load()

    added = 0
    for d in drafts:
        data["queue"].append({
            "queue_id": uuid.uuid4().hex[:8],
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            **d,
        })
        data["seen_gig_ids"].append(d["gig_id"])
        added += 1

    # Keep seen list bounded so state.json doesn't grow forever.
    data["seen_gig_ids"] = data["seen_gig_ids"][-2000:]
    state.save(data)

    print(f"   {added} proposal(s) queued for review. Run: python -m src.cli review")
    context["queued"] = added
    return context
