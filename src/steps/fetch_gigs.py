"""Step: fetch_gigs — pull gigs from configured sources into the context."""
from __future__ import annotations

from typing import Any

from src.engine import register
from src.integrations import job_sources
from src import state


@register("fetch_gigs")
def fetch_gigs(context: dict[str, Any], sources: list[str] | None = None,
               max_per_source: int = 40) -> dict[str, Any]:
    sources = sources or ["remotive"]
    gigs = job_sources.fetch(sources, max_per_source)

    # Drop gigs we've already processed in a previous run.
    seen = set(state.load()["seen_gig_ids"])
    fresh = [g for g in gigs if g["id"] not in seen]
    print(f"   {len(gigs)} fetched, {len(fresh)} new (rest already seen)")

    context["gigs"] = fresh
    return context
