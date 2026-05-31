"""Dead-simple JSON-backed persistence. No database needed for this scale.

State lives in data/state.json (gitignored). Everything the system remembers
between runs goes here: seen gigs, the proposal review queue, and earnings.
"""
from __future__ import annotations

import json
import os
import threading
from datetime import date
from typing import Any

_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
_STATE_PATH = os.path.join(_DATA_DIR, "state.json")
_LOCK = threading.Lock()

_DEFAULT: dict[str, Any] = {
    "seen_gig_ids": [],   # so we never re-draft for the same gig
    "queue": [],          # proposals awaiting approval
    "earnings": [],       # [{date, amount, note}]
}


def _ensure_dir() -> None:
    os.makedirs(_DATA_DIR, exist_ok=True)


def load() -> dict[str, Any]:
    _ensure_dir()
    if not os.path.exists(_STATE_PATH):
        return json.loads(json.dumps(_DEFAULT))  # deep copy
    with open(_STATE_PATH, encoding="utf-8") as f:
        data = json.load(f)
    # Backfill any missing keys so older state files keep working.
    for key, default in _DEFAULT.items():
        data.setdefault(key, json.loads(json.dumps(default)))
    return data


def save(data: dict[str, Any]) -> None:
    _ensure_dir()
    with _LOCK:
        tmp = _STATE_PATH + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        os.replace(tmp, _STATE_PATH)


def add_earning(amount: float, note: str = "") -> dict[str, Any]:
    data = load()
    entry = {"date": date.today().isoformat(), "amount": round(float(amount), 2), "note": note}
    data["earnings"].append(entry)
    save(data)
    return entry


def earned_today() -> float:
    today = date.today().isoformat()
    return round(sum(e["amount"] for e in load()["earnings"] if e["date"] == today), 2)


def earned_total() -> float:
    return round(sum(e["amount"] for e in load()["earnings"]), 2)
