"""The dynamic workflow engine.

A workflow is a YAML file listing ordered steps. Each step names a function
registered in the STEP_REGISTRY (see src/steps/__init__.py) and optional `with`
arguments. The engine threads a shared `context` dict through every step, so a
step can read what earlier steps produced and add its own results.

This is deliberately tiny — the value is the *composability*, not the framework.
"""
from __future__ import annotations

import os
import time
from typing import Any, Callable

import yaml

# A step is a callable: (context, **kwargs) -> context
Step = Callable[..., dict[str, Any]]
STEP_REGISTRY: dict[str, Step] = {}


def register(name: str) -> Callable[[Step], Step]:
    """Decorator to register a step function under a name used in workflow YAML."""
    def deco(fn: Step) -> Step:
        if name in STEP_REGISTRY:
            raise ValueError(f"Step '{name}' is already registered")
        STEP_REGISTRY[name] = fn
        return fn
    return deco


def _workflow_path(name: str) -> str:
    root = os.path.dirname(os.path.dirname(__file__))
    return os.path.join(root, "workflows", f"{name}.yaml")


def load_workflow(name: str) -> dict[str, Any]:
    path = _workflow_path(name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"No workflow named '{name}' at {path}")
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def run_workflow(name: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    """Run every step in the named workflow, in order, sharing one context dict."""
    # Importing steps registers them as a side effect.
    import src.steps  # noqa: F401

    wf = load_workflow(name)
    context = context or {}
    context.setdefault("workflow", name)

    steps = wf.get("steps", [])
    print(f"\n▶  Running workflow '{name}' — {len(steps)} step(s)\n")

    for i, spec in enumerate(steps, 1):
        step_name = spec["uses"]
        kwargs = spec.get("with", {}) or {}
        fn = STEP_REGISTRY.get(step_name)
        if fn is None:
            raise KeyError(
                f"Workflow '{name}' uses unknown step '{step_name}'. "
                f"Known steps: {sorted(STEP_REGISTRY)}"
            )
        label = f"[{i}/{len(steps)}] {step_name}"
        print(f"⏳ {label} ...")
        started = time.time()
        context = fn(context, **kwargs) or context
        print(f"✅ {label} ({time.time() - started:.1f}s)\n")

    print("🏁 Workflow complete.\n")
    return context
