"""Loads .env and profile.yaml. Falls back to safe demo defaults."""
from __future__ import annotations

import os
from typing import Any

import yaml

_ROOT = os.path.dirname(os.path.dirname(__file__))


def _load_dotenv() -> None:
    """Minimal .env loader so we don't add a dependency just for this."""
    path = os.path.join(_ROOT, ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())


_load_dotenv()


def get(key: str, default: str | None = None) -> str | None:
    return os.environ.get(key, default)


def daily_goal() -> float:
    try:
        return float(os.environ.get("DAILY_GOAL_USD", "10"))
    except ValueError:
        return 10.0


def claude_model() -> str:
    return os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")


def has_api_key() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


_DEMO_PROFILE: dict[str, Any] = {
    "name": "Demo User",
    "headline": "Freelance developer & writer",
    "skills": [
        {"name": "python", "weight": 5},
        {"name": "web scraping", "weight": 4},
        {"name": "copywriting", "weight": 3},
        {"name": "data entry", "weight": 2},
    ],
    "exclude": ["unpaid", "equity only"],
    "min_budget_usd": 20,
    "bio": "I build small web tools and write clear, conversion-focused copy.",
    "proposals_per_run": 5,
}


def load_profile() -> dict[str, Any]:
    path = os.path.join(_ROOT, "profile.yaml")
    if not os.path.exists(path):
        print("⚠️  No profile.yaml found — using demo profile. "
              "Copy profile.example.yaml to profile.yaml to customize.")
        return _DEMO_PROFILE
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or _DEMO_PROFILE


_DEMO_CONTENT: dict[str, Any] = {
    "niches": ["home coffee gear", "productivity apps"],
    "affiliate_links": [
        {"keyword": "coffee", "label": "the grinder I recommend",
         "url": "https://example.com/aff/grinder?ref=you"},
        {"keyword": "productivity", "label": "the app I actually use",
         "url": "https://example.com/aff/app?ref=you"},
    ],
    "platform": "blog",
    "format": "social",
    "posts_per_run": 3,
    "disclosure": "Disclosure: contains affiliate links. I may earn a commission at no extra cost to you.",
}


def load_content() -> dict[str, Any]:
    path = os.path.join(_ROOT, "content.yaml")
    if not os.path.exists(path):
        print("⚠️  No content.yaml found — using demo content config. "
              "Copy content.example.yaml to content.yaml to customize.")
        return _DEMO_CONTENT
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or _DEMO_CONTENT
