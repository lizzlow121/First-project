"use client";

import { useCountdown } from "@/hooks/useCountdown";
import type { Race } from "@/types";
import { formatGoalTime, weeksUntil } from "@/lib/utils";
import { Trophy, Clock } from "lucide-react";
import Link from "next/link";

interface RaceReadinessHeroProps {
  race: Race | null;
  readinessScore: number;
}

export function RaceReadinessHero({ race, readinessScore }: RaceReadinessHeroProps) {
  const countdown = useCountdown(race?.race_date ?? null);

  if (!race) {
    return (
      <div className="rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
        <Trophy className="h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="text-[var(--color-text-secondary)] text-sm">No upcoming race</p>
        <Link
          href="/races"
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          Add your next race
        </Link>
      </div>
    );
  }

  const ragColor =
    readinessScore >= 70 ? "var(--color-green)" :
    readinessScore >= 40 ? "var(--color-amber)" :
    "var(--color-red)";

  const statusText =
    readinessScore >= 70 ? "On track — keep it up" :
    readinessScore >= 40 ? "Making progress — stay consistent" :
    "Behind pace — time to focus";

  const weeks = weeksUntil(race.race_date);

  return (
    <div className="rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Next Race</p>
          <h2 className="text-lg font-bold">{race.name}</h2>
          {race.location && <p className="text-sm text-[var(--color-text-secondary)]">{race.location}</p>}
        </div>
        {race.goal_time_seconds && (
          <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] shrink-0">
            <Clock className="h-3.5 w-3.5" />
            <span>Goal: {formatGoalTime(race.goal_time_seconds)}</span>
          </div>
        )}
      </div>

      {/* Countdown */}
      <div className="flex items-end gap-4">
        <div className="flex gap-3">
          {[
            { val: countdown.days, label: "days" },
            { val: countdown.hours, label: "hrs" },
            { val: countdown.minutes, label: "min" },
            { val: countdown.seconds, label: "sec" },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-3xl font-bold tabular-nums leading-none">{val.toString().padStart(2, "0")}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase mt-1">{label}</span>
            </div>
          ))}
        </div>
        <span className="text-sm text-[var(--color-text-muted)] mb-1">
          {weeks} week{weeks !== 1 ? "s" : ""} to go
        </span>
      </div>

      {/* Readiness bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-text-secondary)]">{statusText}</span>
          <span className="font-semibold" style={{ color: ragColor }}>{readinessScore}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--color-surface-3)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${readinessScore}%`, backgroundColor: ragColor }}
          />
        </div>
      </div>
    </div>
  );
}
