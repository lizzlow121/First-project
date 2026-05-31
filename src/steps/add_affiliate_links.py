"""Step: add_affiliate_links — weave relevant affiliate links into each post,
append the required FTC disclosure, then normalize into the shared review-queue
shape so enqueue_review/report and the web dashboard work unchanged.

A link is only added when its keyword appears in the post body, title, or niche
— this keeps posts relevant and avoids spammy link-stuffing.
"""
from __future__ import annotations

import hashlib
from typing import Any

from src.engine import register
from src import config


def _content_id(title: str) -> str:
    return "content-" + hashlib.sha1(title.encode("utf-8")).hexdigest()[:12]


@register("add_affiliate_links")
def add_affiliate_links(context: dict[str, Any]) -> dict[str, Any]:
    content_cfg = config.load_content()
    links = content_cfg.get("affiliate_links", [])
    disclosure = content_cfg.get("disclosure", "").strip()

    drafts = []
    total_links = 0
    for post in context.get("content_drafts", []):
        haystack = (post["body"] + " " + post["title"] + " " + post["niche"]).lower()
        matched = [l for l in links if l.get("keyword", "").lower() in haystack]

        body = post["body"]
        if matched:
            body += "\n\n" + "\n".join(
                f"👉 {l.get('label', 'Recommended')}: {l['url']}" for l in matched
            )
        if disclosure:
            body += f"\n\n{disclosure}"
        total_links += len(matched)

        # Normalize to the shared queue shape used by enqueue_review.
        first_url = matched[0]["url"] if matched else ""
        drafts.append({
            "gig_id": _content_id(post["title"]),
            "title": post["title"],
            "url": first_url,
            "source": f"content/{post['niche']}",
            "score": len(matched),   # # of affiliate links woven in
            "proposal": body,        # the publishable post text
        })

    print(f"   {len(drafts)} post(s) ready, {total_links} affiliate link(s) inserted")
    if disclosure:
        print("   FTC disclosure appended to every post.")
    context["drafts"] = drafts
    return context
