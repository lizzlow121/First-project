"""Pulls real remote gigs from free, public sources.

- Remotive: free JSON API, no key (https://remotive.com/api/remote-jobs)
- We Work Remotely: public RSS feed

If the network is unavailable, returns a small set of mock gigs so the rest of
the pipeline still runs (useful for demos and offline testing).
"""
from __future__ import annotations

import hashlib
from typing import Any

try:
    import requests
except ImportError:  # keep importable even before pip install
    requests = None  # type: ignore

try:
    import feedparser
except ImportError:
    feedparser = None  # type: ignore

_TIMEOUT = 15
# Some job APIs reject requests without a browser-like User-Agent.
_HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; AutopilotBot/0.1; +freelance-automation)"}


def _gig_id(source: str, url: str) -> str:
    return source + "-" + hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]


def _mock_gigs() -> list[dict[str, Any]]:
    samples = [
        ("Build a Python script to scrape product prices", "python web scraping automation", 150),
        ("Landing page copywriting for SaaS startup", "copywriting marketing conversion", 200),
        ("Data entry: clean up 500-row spreadsheet", "data entry excel", 40),
        ("React bug fix on small dashboard", "react javascript frontend", 80),
        ("Unpaid internship for exposure", "marketing", 0),
    ]
    out = []
    for title, desc, budget in samples:
        url = "https://example.com/" + title.lower().replace(" ", "-")[:30]
        out.append({
            "id": _gig_id("mock", url),
            "source": "mock",
            "title": title,
            "description": desc,
            "url": url,
            "budget_usd": budget,
        })
    return out


def fetch_remotive(limit: int) -> list[dict[str, Any]]:
    if requests is None:
        return []
    try:
        r = requests.get("https://remotive.com/api/remote-jobs", headers=_HEADERS, timeout=_TIMEOUT)
        r.raise_for_status()
        jobs = r.json().get("jobs", [])[:limit]
    except Exception as e:  # network/parse issues shouldn't crash the workflow
        print(f"   (remotive unavailable: {e})")
        return []
    out = []
    for j in jobs:
        url = j.get("url", "")
        out.append({
            "id": _gig_id("remotive", url),
            "source": "remotive",
            "title": j.get("title", ""),
            "description": _strip_html(j.get("description", ""))[:1200],
            "url": url,
            "budget_usd": None,  # Remotive rarely exposes budget
        })
    return out


def fetch_weworkremotely(limit: int) -> list[dict[str, Any]]:
    if feedparser is None:
        return []
    try:
        feed = feedparser.parse("https://weworkremotely.com/remote-jobs.rss")
    except Exception as e:
        print(f"   (weworkremotely unavailable: {e})")
        return []
    out = []
    for entry in feed.entries[:limit]:
        url = entry.get("link", "")
        out.append({
            "id": _gig_id("wwr", url),
            "source": "weworkremotely",
            "title": entry.get("title", ""),
            "description": _strip_html(entry.get("summary", ""))[:1200],
            "url": url,
            "budget_usd": None,
        })
    return out


def _strip_html(text: str) -> str:
    import re
    return re.sub(r"<[^>]+>", " ", text or "").replace("&amp;", "&").strip()


_SOURCES = {
    "remotive": fetch_remotive,
    "weworkremotely": fetch_weworkremotely,
}


def fetch(sources: list[str], max_per_source: int) -> list[dict[str, Any]]:
    gigs: list[dict[str, Any]] = []
    for src in sources:
        fn = _SOURCES.get(src)
        if not fn:
            print(f"   (unknown source '{src}', skipping)")
            continue
        found = fn(max_per_source)
        print(f"   {src}: {len(found)} gigs")
        gigs.extend(found)
    if not gigs:
        print("   No live gigs fetched — using mock data so the demo still runs.")
        gigs = _mock_gigs()
    return gigs
