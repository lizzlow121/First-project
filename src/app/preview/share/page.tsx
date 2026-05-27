import { Trophy, MapPin, Calendar, Target, Zap } from "lucide-react";
import { format, addDays } from "date-fns";

export default function PreviewShare() {
  const raceDate = addDays(new Date(), 28);
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] flex flex-col">
      <header className="border-b border-[var(--color-border)] px-6 py-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold">Athlete HQ</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-3xl bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-surface-2)] border border-[var(--color-border-light)] p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            <Trophy className="h-3.5 w-3.5" />
            Training toward
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Hyrox London</h1>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)] mb-6">
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />ExCeL London</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{format(raceDate, "MMM d, yyyy")}</span>
          </div>

          <div className="rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-6">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Countdown</p>
            <div className="flex justify-between gap-2">
              {[
                { val: 28, label: "days" },
                { val: 14, label: "hours" },
                { val: 32, label: "mins" },
                { val: 18, label: "secs" },
              ].map(({ val, label }) => (
                <div key={label} className="flex-1 text-center">
                  <p className="text-4xl font-bold tabular-nums leading-none">{val.toString().padStart(2, "0")}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase mt-1.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-[var(--color-orange)]" />
            <span className="text-[var(--color-text-secondary)]">Goal time:</span>
            <span className="font-semibold tabular-nums">1:05:00</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-[var(--color-text-muted)]">Training toward your own race? Track everything in one place.</p>
        <a href="/signup" className="text-xs font-medium text-[var(--color-accent)] hover:underline">Try Athlete HQ →</a>
      </footer>
    </div>
  );
}
