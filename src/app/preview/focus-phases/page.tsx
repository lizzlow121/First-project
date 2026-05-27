import { WeeklyFocusBar } from "@/components/dashboard/WeeklyFocusBar";
import { getRacePhase } from "@/lib/race-phase";

const SNAPSHOTS = [
  { days: 84, label: "12 weeks out" },
  { days: 56, label: "8 weeks out" },
  { days: 28, label: "4 weeks out" },
  { days: 10, label: "10 days out" },
  { days: 3, label: "3 days out" },
  { days: 0, label: "Race day" },
];

export default function PreviewFocusPhases() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Hyrox training phases</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            What the dashboard tells you to focus on at each stage of race prep
          </p>
        </div>

        <div className="space-y-4">
          {SNAPSHOTS.map(({ days, label }) => {
            const phase = getRacePhase(days, "hyrox");
            return (
              <div key={label} className="grid grid-cols-[100px_1fr] gap-4 items-start">
                <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider pt-4">
                  {label}
                </span>
                <WeeklyFocusBar phase={phase} />
              </div>
            );
          })}
        </div>

        <div className="pt-8">
          <h2 className="text-base font-bold mb-3">Marathon (generic running)</h2>
          <div className="grid grid-cols-2 gap-4">
            {[84, 28, 10, 2].map((days) => (
              <WeeklyFocusBar key={days} phase={getRacePhase(days, "marathon")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
