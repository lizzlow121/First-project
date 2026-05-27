"use client";

import { useCountdown } from "@/hooks/useCountdown";

export function ShareCountdown({ raceDate }: { raceDate: string }) {
  const c = useCountdown(raceDate);

  return (
    <div className="rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-6">
      <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
        Countdown
      </p>
      <div className="flex justify-between gap-2">
        {[
          { val: c.days, label: "days" },
          { val: c.hours, label: "hours" },
          { val: c.minutes, label: "mins" },
          { val: c.seconds, label: "secs" },
        ].map(({ val, label }) => (
          <div key={label} className="flex-1 text-center">
            <p className="text-4xl font-bold tabular-nums leading-none">
              {val.toString().padStart(2, "0")}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase mt-1.5">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
