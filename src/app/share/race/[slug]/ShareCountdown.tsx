"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { SandTimer } from "@/components/dashboard/SandTimer";

export function ShareCountdown({ raceDate }: { raceDate: string }) {
  const c = useCountdown(raceDate);

  return (
    <div className="rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-6">
      <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
        Countdown
      </p>
      <div className="flex items-center gap-6">
        <SandTimer raceDate={raceDate} size={96} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold tabular-nums leading-none">{c.days}</span>
            <span className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              day{c.days !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-base text-[var(--color-text-secondary)] tabular-nums mt-3">
            {c.hours}h {c.minutes}m {c.seconds.toString().padStart(2, "0")}s
          </p>
        </div>
      </div>
    </div>
  );
}
