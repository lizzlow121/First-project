"""Step: generate_ideas — brainstorm post angles from content.yaml niches.

Kept template-based (no API call) so ideation is free; the actual writing in
draft_content is where Claude adds value.
"""
from __future__ import annotations

import random
from typing import Any

from src.engine import register
from src import config

_ANGLES = [
    "5 things I wish I knew about {niche}",
    "The one {niche} upgrade actually worth it",
    "{niche} on a budget: what to skip",
    "My honest take on {niche} after a year",
    "Beginner mistakes in {niche} (and fixes)",
    "What nobody tells you about {niche}",
]


@register("generate_ideas")
def generate_ideas(context: dict[str, Any]) -> dict[str, Any]:
    content = config.load_content()
    niches = content.get("niches", []) or ["general"]
    n = int(content.get("posts_per_run", 3))

    ideas = []
    attempts = 0
    used = set()
    while len(ideas) < n and attempts < n * 5:
        attempts += 1
        niche = random.choice(niches)
        angle = random.choice(_ANGLES).format(niche=niche)
        if angle in used:
            continue
        used.add(angle)
        ideas.append({"niche": niche, "idea": angle})

    print(f"   {len(ideas)} idea(s) across {len(niches)} niche(s)")
    context["ideas"] = ideas
    return context
