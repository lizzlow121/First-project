"""Claude API wrapper for drafting proposals.

If ANTHROPIC_API_KEY is missing, we fall back to a clean template so the whole
pipeline still works in demo mode — you just get a generic proposal instead of
a tailored one.
"""
from __future__ import annotations

from typing import Any

from src import config

try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None  # type: ignore

_SYSTEM = (
    "You are an expert freelance proposal writer. Write a short, specific, "
    "human proposal (120-180 words) that: opens with a concrete observation "
    "about the client's job, states exactly how the freelancer would approach "
    "it, cites relevant experience from the bio, and ends with one clarifying "
    "question. No fluff, no 'I am excited', no buzzwords. Sound like a real, "
    "competent person."
)


def _template_proposal(gig: dict[str, Any], profile: dict[str, Any]) -> str:
    return (
        f"Hi — regarding \"{gig['title']}\":\n\n"
        f"{profile.get('bio', '').strip()}\n\n"
        f"I can take this on and turn it around quickly. I'd start by confirming "
        f"the exact scope, then deliver in small checkpoints so you can give "
        f"feedback early.\n\n"
        f"One question to scope it accurately: what does 'done' look like for you "
        f"on this — and is there a deadline I should plan around?\n\n"
        f"— {profile.get('name', 'A freelancer')}"
    )


def draft_proposal(gig: dict[str, Any], profile: dict[str, Any]) -> str:
    if not config.has_api_key() or Anthropic is None:
        return _template_proposal(gig, profile)

    client = Anthropic(api_key=config.get("ANTHROPIC_API_KEY"))
    skills = ", ".join(s["name"] for s in profile.get("skills", []))
    prompt = (
        f"FREELANCER PROFILE\n"
        f"Name: {profile.get('name')}\n"
        f"Headline: {profile.get('headline')}\n"
        f"Skills: {skills}\n"
        f"Bio: {profile.get('bio')}\n\n"
        f"JOB POSTING\n"
        f"Title: {gig['title']}\n"
        f"Description: {gig['description']}\n\n"
        f"Write the proposal now."
    )
    try:
        resp = client.messages.create(
            model=config.claude_model(),
            max_tokens=500,
            system=_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.content[0].text.strip()
    except Exception as e:
        print(f"   (Claude API error, using template: {e})")
        return _template_proposal(gig, profile)
