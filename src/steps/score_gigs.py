"""Step: score_gigs — rank gigs against the profile, filter out poor fits.

Scoring is simple and transparent: sum the weights of skills whose keyword
appears in the gig's title/description, with a title-match bonus. Gigs hitting
an exclude keyword, or below min_budget when budget is known, are dropped.
"""
from __future__ import annotations

from typing import Any

from src.engine import register
from src import config


def _score(gig: dict[str, Any], profile: dict[str, Any]) -> int:
    haystack = (gig["title"] + " " + gig["description"]).lower()
    score = 0
    for skill in profile.get("skills", []):
        kw = skill["name"].lower()
        if kw in haystack:
            score += skill.get("weight", 1)
            if kw in gig["title"].lower():
                score += 1  # title matches matter more
    return score


def _excluded(gig: dict[str, Any], profile: dict[str, Any]) -> bool:
    haystack = (gig["title"] + " " + gig["description"]).lower()
    if any(bad.lower() in haystack for bad in profile.get("exclude", [])):
        return True
    budget = gig.get("budget_usd")
    if budget is not None and budget < profile.get("min_budget_usd", 0):
        return True
    return False


@register("score_gigs")
def score_gigs(context: dict[str, Any]) -> dict[str, Any]:
    profile = config.load_profile()
    gigs = context.get("gigs", [])

    scored = []
    dropped = 0
    for gig in gigs:
        if _excluded(gig, profile):
            dropped += 1
            continue
        gig["score"] = _score(gig, profile)
        if gig["score"] > 0:
            scored.append(gig)

    scored.sort(key=lambda g: g["score"], reverse=True)
    print(f"   {len(scored)} relevant gigs (dropped {dropped} excluded/low-budget)")
    if scored:
        print(f"   top match: \"{scored[0]['title']}\" (score {scored[0]['score']})")

    context["scored_gigs"] = scored
    return context
