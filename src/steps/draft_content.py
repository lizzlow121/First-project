"""Step: draft_content — AI-write each post body from the generated ideas."""
from __future__ import annotations

from typing import Any

from src.engine import register
from src.integrations import claude
from src import config


@register("draft_content")
def draft_content(context: dict[str, Any]) -> dict[str, Any]:
    content_cfg = config.load_content()
    fmt = content_cfg.get("format", "social")
    ideas = context.get("ideas", [])

    if not ideas:
        print("   No ideas to draft.")
        context["content_drafts"] = []
        return context

    mode = "Claude" if config.has_api_key() else "template (no API key set)"
    print(f"   Drafting {len(ideas)} {fmt} post(s) via {mode}")

    drafts = []
    for item in ideas:
        body = claude.draft_content(item["idea"], item["niche"], fmt)
        drafts.append({
            "title": item["idea"],
            "niche": item["niche"],
            "format": fmt,
            "body": body,
        })
        print(f"   ✎ {item['idea'][:60]}")

    context["content_drafts"] = drafts
    return context
