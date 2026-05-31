"""Interactive first-run wizard: python -m src.cli setup

Walks a new user through creating .env (keys, model, goal) and profile.yaml
(name, skills, budget), then offers to run the first workflow. Safe to re-run:
it never overwrites an existing file without explicit confirmation.
"""
from __future__ import annotations

import os

import yaml

_ROOT = os.path.dirname(os.path.dirname(__file__))
_ENV_PATH = os.path.join(_ROOT, ".env")
_PROFILE_PATH = os.path.join(_ROOT, "profile.yaml")


def _ask(prompt: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    try:
        val = input(f"{prompt}{suffix}: ").strip()
    except EOFError:
        val = ""
    return val or default


def _yes(prompt: str, default: bool = True) -> bool:
    d = "Y/n" if default else "y/N"
    ans = _ask(f"{prompt} ({d})").lower()
    if not ans:
        return default
    return ans.startswith("y")


def _confirm_overwrite(path: str) -> bool:
    if not os.path.exists(path):
        return True
    return _yes(f"{os.path.basename(path)} already exists — overwrite?", default=False)


def _write_env() -> None:
    print("\n── Step 1 of 2: API keys & settings (.env) ──")
    if not _confirm_overwrite(_ENV_PATH):
        print("   Keeping existing .env.")
        return

    print("   Get an Anthropic key at https://console.anthropic.com")
    print("   (Leave blank to run in demo mode — template proposals, no API cost.)")
    api_key = _ask("   ANTHROPIC_API_KEY")

    print("   Model: claude-opus-4-8 (best) / claude-sonnet-4-6 (balanced) / claude-haiku-4-5 (cheapest)")
    model = _ask("   CLAUDE_MODEL", "claude-sonnet-4-6")
    goal = _ask("   Daily earnings goal (USD)", "10")

    lines = [
        f"ANTHROPIC_API_KEY={api_key}",
        f"CLAUDE_MODEL={model}",
        f"DAILY_GOAL_USD={goal}",
        "",
    ]
    with open(_ENV_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"   ✅ Wrote {_ENV_PATH}" + ("" if api_key else "  (demo mode — no key set)"))


def _write_profile() -> None:
    print("\n── Step 2 of 2: Your freelancer profile (profile.yaml) ──")
    if not _confirm_overwrite(_PROFILE_PATH):
        print("   Keeping existing profile.yaml.")
        return

    name = _ask("   Your name", "Freelancer")
    headline = _ask("   One-line headline", "Freelance developer & writer")

    print("   Enter your skills with a priority weight 1-5 (blank line to finish).")
    print("   Example:  python 5    |   copywriting 3")
    skills = []
    while True:
        raw = _ask(f"   skill #{len(skills) + 1}")
        if not raw:
            break
        parts = raw.rsplit(" ", 1)
        if len(parts) == 2 and parts[1].isdigit():
            skills.append({"name": parts[0].strip().lower(), "weight": int(parts[1])})
        else:
            skills.append({"name": raw.strip().lower(), "weight": 3})
    if not skills:
        skills = [{"name": "python", "weight": 5}, {"name": "copywriting", "weight": 3}]
        print("   (No skills entered — using sensible defaults.)")

    min_budget = _ask("   Minimum acceptable budget (USD)", "20")
    bio = _ask("   Short bio (one or two sentences)",
               "I build small web tools and write clear, conversion-focused copy.")
    per_run = _ask("   How many proposals to draft per run", "5")

    profile = {
        "name": name,
        "headline": headline,
        "skills": skills,
        "exclude": ["unpaid", "equity only", "crypto airdrop"],
        "min_budget_usd": int(min_budget) if min_budget.isdigit() else 20,
        "bio": bio,
        "proposals_per_run": int(per_run) if per_run.isdigit() else 5,
    }
    with open(_PROFILE_PATH, "w", encoding="utf-8") as f:
        yaml.safe_dump(profile, f, sort_keys=False, allow_unicode=True)
    print(f"   ✅ Wrote {_PROFILE_PATH} with {len(skills)} skill(s)")


def run_setup() -> int:
    print("\n🛫  Autopilot quickstart wizard")
    print("    This sets up your keys and profile so the workflow can run.\n")

    _write_env()
    _write_profile()

    print("\n✨ Setup complete!")
    print("   Next:")
    print("     • python -m src.cli run freelance_daily   (discover + draft + queue)")
    print("     • python -m src.cli web                   (review & approve in browser)")
    print("     • python -m src.cli status                (check goal progress)\n")

    if _yes("Run your first cycle now?", default=True):
        from src.engine import run_workflow
        run_workflow("freelance_daily")
        print("Tip: review the drafted proposals with  python -m src.cli web")
    return 0
