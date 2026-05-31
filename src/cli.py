"""Command-line interface.

  python -m src.cli run <workflow>     Run a workflow (e.g. freelance_daily)
  python -m src.cli review             Approve/reject queued proposals
  python -m src.cli earn <amount>      Log income you actually earned
  python -m src.cli status             Show goal progress and the queue
  python -m src.cli list               List available workflows
"""
from __future__ import annotations

import argparse
import os
import sys

from src import config, state
from src.engine import run_workflow


def _cmd_run(args: argparse.Namespace) -> int:
    run_workflow(args.workflow)
    return 0


def _cmd_list(_: argparse.Namespace) -> int:
    root = os.path.dirname(os.path.dirname(__file__))
    wf_dir = os.path.join(root, "workflows")
    print("Available workflows:")
    for f in sorted(os.listdir(wf_dir)):
        if f.endswith(".yaml"):
            print(f"  - {f[:-5]}")
    return 0


def _cmd_review(_: argparse.Namespace) -> int:
    data = state.load()
    pending = [q for q in data["queue"] if q["status"] == "pending"]
    if not pending:
        print("No proposals pending review. Run a workflow first.")
        return 0

    print(f"\n{len(pending)} proposal(s) pending review.\n")
    for q in pending:
        print("=" * 70)
        print(f"[{q['queue_id']}] {q['title']}  (score {q['score']}, via {q['source']})")
        print(f"Apply at: {q['url']}")
        print("-" * 70)
        print(q["proposal"])
        print("-" * 70)
        choice = input("(a)pprove  (r)eject  (s)kip  (q)uit > ").strip().lower()
        if choice == "q":
            break
        if choice == "a":
            q["status"] = "approved"
            print("✅ Approved — copy the proposal above and apply on the platform.")
        elif choice == "r":
            q["status"] = "rejected"
            print("🗑  Rejected.")
        else:
            print("⏭  Skipped (stays pending).")
        print()

    state.save(data)
    approved = sum(1 for q in data["queue"] if q["status"] == "approved")
    print(f"\nDone. {approved} approved proposal(s) total, ready to apply.")
    return 0


def _cmd_earn(args: argparse.Namespace) -> int:
    entry = state.add_earning(args.amount, args.note or "")
    goal = config.daily_goal()
    today = state.earned_today()
    print(f"💰 Logged ${entry['amount']:.2f}" + (f" — {entry['note']}" if entry['note'] else ""))
    print(f"   Today: ${today:.2f} / ${goal:.2f}"
          + ("  🎉 goal reached!" if today >= goal else ""))
    return 0


def _cmd_status(_: argparse.Namespace) -> int:
    goal = config.daily_goal()
    data = state.load()
    pending = sum(1 for q in data["queue"] if q["status"] == "pending")
    approved = sum(1 for q in data["queue"] if q["status"] == "approved")
    print("Autopilot status")
    print(f"  Daily goal      : ${goal:.2f}")
    print(f"  Earned today    : ${state.earned_today():.2f}")
    print(f"  Earned all-time : ${state.earned_total():.2f}")
    print(f"  Queue           : {pending} pending, {approved} approved")
    print(f"  API key set     : {'yes' if config.has_api_key() else 'no (demo mode)'}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="autopilot", description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_run = sub.add_parser("run", help="Run a workflow")
    p_run.add_argument("workflow")
    p_run.set_defaults(func=_cmd_run)

    sub.add_parser("list", help="List workflows").set_defaults(func=_cmd_list)
    sub.add_parser("review", help="Review queued proposals").set_defaults(func=_cmd_review)
    sub.add_parser("status", help="Show goal progress").set_defaults(func=_cmd_status)

    p_earn = sub.add_parser("earn", help="Log earned income")
    p_earn.add_argument("amount", type=float)
    p_earn.add_argument("--note", default="")
    p_earn.set_defaults(func=_cmd_earn)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
