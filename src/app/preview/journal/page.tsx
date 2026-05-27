import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Sun, Moon, Sparkles, BookOpen } from "lucide-react";
import { format, subDays } from "date-fns";

export default function PreviewJournal() {
  const today = new Date();
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold">Journal</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {format(today, "EEEE, MMMM d")}
          </p>
        </div>

        {/* Morning */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[var(--color-amber-dim)]/40 p-2">
                <Sun className="h-4 w-4 text-[var(--color-amber)]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Morning check-in</h2>
                <p className="text-xs text-[var(--color-text-muted)]">Set your intention for the day</p>
              </div>
            </div>

            <div className="rounded-lg bg-[var(--color-surface-2)] p-3 border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Today&apos;s snapshot</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-[var(--color-text-muted)]">Sleep last night</p>
                  <p className="font-semibold text-sm mt-0.5">7.5h</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Recovery</p>
                  <p className="font-semibold text-sm mt-0.5">8/10</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Training</p>
                  <p className="font-semibold text-sm mt-0.5">Intervals 6×400m</p>
                </div>
              </div>
            </div>

            <Textarea
              label="What's your intention for today?"
              placeholder="Stay calm under pressure during my intervals — focus on form, not the clock."
              defaultValue="Stay calm under pressure during my intervals — focus on form, not the clock."
              rows={2}
            />
            <Button size="sm">Save intention</Button>
          </CardContent>
        </Card>

        {/* Evening */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[var(--color-accent-dim)] p-2">
                <Moon className="h-4 w-4 text-[var(--color-accent)]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Evening reflection</h2>
                <p className="text-xs text-[var(--color-text-muted)]">Personalized prompts based on your day</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                AI prompts for tonight
              </div>
              <div className="space-y-2">
                {[
                  "You hit 6×400m at effort 9/10 — how did your body respond on the last two reps compared to the first?",
                  "Your morning intention was 'stay calm under pressure.' Where did that show up today, and where did it slip?",
                  "Hyrox London is 28 days away. What's one thing you'd want to dial in this week?",
                ].map((q, i) => (
                  <div key={i} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 p-3 text-sm leading-relaxed">
                    {q}
                  </div>
                ))}
              </div>
            </div>

            <Textarea
              label="Tonight's reflection"
              placeholder="What went well? What would you do differently?"
              rows={5}
            />
            <Button size="sm">Save reflection</Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <h3 className="text-sm font-semibold">Recent entries</h3>
            </div>
            {[
              { date: subDays(today, 1), type: "evening", preview: "Long run felt smooth. Pace was 6:00/km for 15km without forcing it. Recovery feels solid." },
              { date: subDays(today, 1), type: "morning", preview: "Build the engine. Don't chase splits today." },
              { date: subDays(today, 2), type: "evening", preview: "Strength session was tough — sled push left my legs cooked." },
            ].map((e, i) => (
              <div key={i} className="border-b border-[var(--color-border)] last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[var(--color-text-muted)]">{format(e.date, "MMM d")}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{e.type}</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">{e.preview}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
