"""Step: draft_proposals — AI-draft proposals for the top-scored gigs."""
from __future__ import annotations

from typing import Any

from src.engine import register
from src.integrations import claude
from src import config


@register("draft_proposals")
def draft_proposals(context: dict[str, Any]) -> dict[str, Any]:
    profile = config.load_profile()
    n = int(profile.get("proposals_per_run", 5))
    top = context.get("scored_gigs", [])[:n]

    if not top:
        print("   No gigs to draft for.")
        context["drafts"] = []
        return context

    mode = "Claude" if config.has_api_key() else "template (no API key set)"
    print(f"   Drafting {len(top)} proposal(s) via {mode}")

    drafts = []
    for gig in top:
        text = claude.draft_proposal(gig, profile)
        drafts.append({
            "gig_id": gig["id"],
            "title": gig["title"],
            "url": gig["url"],
            "source": gig["source"],
            "score": gig["score"],
            "proposal": text,
        })
        print(f"   ✎ {gig['title'][:60]}")

    context["drafts"] = drafts
    return context
