# Autopilot — Dynamic Workflow Engine + Freelance Income Automation

A small, honest automation system. It does the repetitive grind behind a
freelance income stream **autonomously**, and tracks your progress toward a
daily earnings goal (default: **$10/day**).

## What it actually does (and doesn't)

**It does, on a schedule, with zero input from you:**

1. **Discovers gigs** from real remote job feeds (Remotive API + RSS boards).
2. **Scores** each gig against *your* skills/profile and filters out the noise.
3. **Drafts a tailored proposal** for the best matches using the Claude API.
4. **Queues** the drafts for you to approve.

**It does NOT:**

- Magically create money. Income only happens when you (a) approve good
  proposals and (b) win and deliver the work.
- Auto-submit proposals to clients. That violates most platforms' Terms of
  Service and gets accounts banned. A human approves before anything is sent.
- Guarantee $10/day. `$10/day` is a **goal you track**, not a promise the
  software can keep. Realistically you may need to send 5–15 proposals to land
  one small gig — the system just makes sending them nearly free in effort.

## Income engines (workflows)

Two are included; both feed the same review queue and dashboard:

- **`freelance_daily`** — discovers gigs, scores them against your skills, drafts
  proposals. You approve, then apply on-platform. Never auto-submits (ToS-safe).
- **`content_daily`** — drafts useful posts for your niches, weaves in *relevant*
  affiliate links, and appends an FTC disclosure to every post. You approve, then
  publish manually. Links are only inserted when their keyword fits the post —
  no spam, and the disclosure is mandatory (don't remove it).

## The "dynamic" part

Workflows are defined in YAML (`workflows/*.yaml`), not hardcoded. Each workflow
is an ordered list of **steps**; steps are pluggable Python functions registered
by name. You can reorder, add, or remove steps and build entirely new workflows
without touching the engine. See `workflows/freelance_daily.yaml`.

## Quick start

```bash
pip install -r requirements.txt

# Easiest: interactive wizard that creates .env + profile.yaml for you,
# then optionally runs your first cycle.
python -m src.cli setup

# (Or set it up by hand instead of the wizard:)
#   cp .env.example .env                     # then fill in your keys
#   cp profile.example.yaml profile.yaml     # then describe your skills

# Run the freelance workflow once:
python -m src.cli run freelance_daily

# ...or the content/affiliate workflow (second income engine):
cp content.example.yaml content.yaml    # then add your niches + affiliate links
python -m src.cli run content_daily

# Review and approve drafted proposals (terminal):
python -m src.cli review

# ...or use the web dashboard (approve/reject by click, see goal progress):
python -m src.cli web        # then open http://127.0.0.1:5000

# Log income you actually earned, and see goal progress:
python -m src.cli earn 25 --note "Won logo gig"
python -m src.cli status
```

Run with no API key set and it falls back to a safe demo mode (mock gig data,
template proposals) so you can see the whole flow before committing real keys.

## Required accounts / keys

| Key | What for | Where |
|-----|----------|-------|
| `ANTHROPIC_API_KEY` | Drafting proposals with Claude | console.anthropic.com |
| (optional) freelance platform login | You apply manually after approving | Upwork / Fiverr / Contra / etc. |

## Scheduling it (the "autonomous" part)

Add to your crontab to run every morning:

```cron
0 8 * * * cd /path/to/First-project && /usr/bin/python -m src.cli run freelance_daily >> data/cron.log 2>&1
```

Then you just check the review queue once a day and approve the good ones.
