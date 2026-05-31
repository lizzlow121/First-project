"""Importing this package registers every step with the engine.

Add a new step by creating a module here and decorating a function with
@register("step_name"). Then reference that name from any workflow YAML.
"""
from . import fetch_gigs, score_gigs, draft_proposals, enqueue_review, report  # noqa: F401
