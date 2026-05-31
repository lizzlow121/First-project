"""A tiny local web dashboard for reviewing proposals and tracking the goal.

Run with:  python -m src.cli web    (or: python -m src.web)

It reads/writes the same data/state.json the CLI uses, so the web UI and the
terminal stay in sync. Intended for local use only (binds to 127.0.0.1).
"""
from __future__ import annotations

from flask import Flask, redirect, render_template_string, request, url_for

from src import config, state

app = Flask(__name__)

_PAGE = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Autopilot — Review</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 820px;
           margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    header { display: flex; justify-content: space-between; align-items: baseline;
             flex-wrap: wrap; gap: .5rem; }
    h1 { font-size: 1.4rem; margin: 0; }
    .goal { background: #f3f4f6; border-radius: 10px; padding: .9rem 1.1rem; margin: 1rem 0 1.5rem; }
    @media (prefers-color-scheme: dark) { .goal { background: #1f2937; } .card { background:#111827; border-color:#374151;} }
    .bar { height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; margin-top: .5rem; }
    .bar > span { display: block; height: 100%; background: #16a34a; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem 1.2rem; margin-bottom: 1rem; }
    .meta { color: #6b7280; font-size: .85rem; margin-bottom: .4rem; }
    .proposal { white-space: pre-wrap; background: rgba(127,127,127,.08);
                padding: .8rem; border-radius: 8px; font-size: .95rem; }
    .actions { margin-top: .8rem; display: flex; gap: .5rem; align-items: center; }
    button { font: inherit; padding: .45rem .9rem; border-radius: 8px; border: 0; cursor: pointer; }
    .approve { background: #16a34a; color: #fff; }
    .reject { background: #ef4444; color: #fff; }
    a.apply { margin-left: auto; font-size: .9rem; }
    .empty { color: #6b7280; text-align: center; padding: 2rem; }
    form.earn { margin-top: .4rem; display: flex; gap: .5rem; }
    form.earn input { padding: .4rem; border-radius: 6px; border: 1px solid #d1d5db; }
  </style>
</head>
<body>
  <header>
    <h1>🛫 Autopilot — Proposal Review</h1>
    <span class="meta">{{ pending|length }} pending · {{ approved }} approved</span>
  </header>

  <div class="goal">
    <strong>Today: ${{ '%.2f'|format(today) }} / ${{ '%.2f'|format(goal) }}</strong>
    {% if today >= goal %} 🎉 goal reached!{% endif %}
    <div class="bar"><span style="width: {{ pct }}%"></span></div>
    <form class="earn" method="post" action="{{ url_for('earn') }}">
      <input name="amount" type="number" step="0.01" min="0" placeholder="Log income $" required>
      <input name="note" type="text" placeholder="note (optional)">
      <button type="submit">Add</button>
    </form>
  </div>

  {% if not pending %}
    <p class="empty">No proposals pending. Run <code>python -m src.cli run freelance_daily</code> to generate some.</p>
  {% endif %}

  {% for q in pending %}
    <div class="card">
      <div class="meta">score {{ q.score }} · via {{ q.source }} · id {{ q.queue_id }}</div>
      <strong>{{ q.title }}</strong>
      <div class="proposal">{{ q.proposal }}</div>
      <div class="actions">
        <form method="post" action="{{ url_for('decide', queue_id=q.queue_id, decision='approved') }}">
          <button class="approve" type="submit">✓ Approve</button>
        </form>
        <form method="post" action="{{ url_for('decide', queue_id=q.queue_id, decision='rejected') }}">
          <button class="reject" type="submit">✕ Reject</button>
        </form>
        <a class="apply" href="{{ q.url }}" target="_blank" rel="noopener">Open gig to apply →</a>
      </div>
    </div>
  {% endfor %}
</body>
</html>
"""


@app.route("/")
def index() -> str:
    goal = config.daily_goal()
    today = state.earned_today()
    pct = min(100, int(today / goal * 100)) if goal else 0
    return render_template_string(
        _PAGE,
        pending=state.queue_by_status("pending"),
        approved=len(state.queue_by_status("approved")),
        goal=goal,
        today=today,
        pct=pct,
    )


@app.route("/decide/<queue_id>/<decision>", methods=["POST"])
def decide(queue_id: str, decision: str):
    if decision in ("approved", "rejected"):
        state.set_status(queue_id, decision)
    return redirect(url_for("index"))


@app.route("/earn", methods=["POST"])
def earn():
    try:
        amount = float(request.form.get("amount", 0))
        if amount > 0:
            state.add_earning(amount, request.form.get("note", ""))
    except ValueError:
        pass
    return redirect(url_for("index"))


def serve(host: str = "127.0.0.1", port: int = 5000) -> None:
    print(f"\n🛫 Autopilot dashboard → http://{host}:{port}  (Ctrl-C to stop)\n")
    app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    serve()
