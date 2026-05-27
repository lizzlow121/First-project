import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Trophy, MapPin, Calendar, Target, Sparkles } from "lucide-react";
import { addDays, format } from "date-fns";

export default function PreviewRace() {
  const raceDate = addDays(new Date(), 28);
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Race header */}
        <div className="rounded-2xl p-6 border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-surface-2)]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Badge variant="orange" className="mb-2">HYROX OPEN</Badge>
              <h1 className="text-2xl font-bold mb-1">Hyrox London</h1>
              <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />ExCeL London</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{format(raceDate, "MMM d, yyyy")}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">In</p>
              <p className="text-3xl font-bold">28<span className="text-base font-normal text-[var(--color-text-muted)] ml-1">days</span></p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border)]">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Distance</p>
              <p className="text-base font-semibold mt-0.5">8 km + stations</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Goal Time</p>
              <p className="text-base font-semibold mt-0.5">1:05:00</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Fitness</p>
              <p className="text-base font-semibold mt-0.5 capitalize">Intermediate</p>
            </div>
          </div>
        </div>

        {/* Tracking status */}
        <div className="rounded-xl border border-[var(--color-green)]/30 bg-[var(--color-green-dim)]/20 p-4 flex items-center gap-3">
          <div className="rounded-lg bg-[var(--color-green)]/20 p-2">
            <Target className="h-4 w-4 text-[var(--color-green)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">On track for goal time</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Recent run pace averaging 6% within goal pace</p>
          </div>
        </div>

        {/* Pace card */}
        <Card>
          <CardHeader>
            <CardTitle>Target Paces</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            {[
              { zone: "Race pace", val: "8:08 /km", desc: "Run splits between stations", color: "text-[var(--color-orange)]" },
              { zone: "Tempo", val: "8:46 /km", desc: "Sustained threshold work", color: "text-[var(--color-amber)]" },
              { zone: "Easy", val: "10:10 /km", desc: "Recovery & aerobic base", color: "text-[var(--color-green)]" },
              { zone: "Interval", val: "7:34 /km", desc: "VO2max sessions", color: "text-[var(--color-accent)]" },
            ].map((p) => (
              <div key={p.zone} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <div>
                  <p className={`text-sm font-medium ${p.color}`}>{p.zone}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{p.desc}</p>
                </div>
                <span className="text-base font-bold tabular-nums">{p.val}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hyrox station splits */}
        <Card>
          <CardHeader>
            <CardTitle>Hyrox Station Targets</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Ski Erg", t: "3:30" },
                { name: "Sled Push", t: "3:00" },
                { name: "Sled Pull", t: "3:00" },
                { name: "Burpee Broad Jumps", t: "5:00" },
                { name: "Rowing", t: "3:30" },
                { name: "Farmer's Carry", t: "2:00" },
                { name: "Sandbag Lunges", t: "6:00" },
                { name: "Wall Balls", t: "6:00" },
              ].map((s) => (
                <div key={s.name} className="rounded-lg bg-[var(--color-surface-2)] p-3 border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">{s.name}</p>
                  <p className="text-base font-semibold tabular-nums mt-0.5">{s.t}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Generate plan */}
        <Card>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--color-accent-dim)] p-2">
                <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Training Plan</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Auto-generate 4 weeks of structured sessions</p>
              </div>
            </div>
            <Button size="sm">Generate</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
