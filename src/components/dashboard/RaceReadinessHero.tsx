"use client";

import { useCountdown } from "@/hooks/useCountdown";
import type { Race } from "@/types";
import { formatGoalTime } from "@/lib/utils";
import { Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { SandTimer } from "./SandTimer";
import { WeeklyFocusBar } from "./WeeklyFocusBar";
import { getRacePhase } from "@/lib/race-phase";

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

  const daysToRace = Math.max(
    0,
    (new Date(race.race_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const phase = getRacePhase(daysToRace, race.race_type);

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

      {/* Sand timer countdown */}
      <div className="flex items-center gap-6">
        <SandTimer raceDate={race.race_date} size={88} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tabular-nums leading-none">{countdown.days}</span>
            <span className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              day{countdown.days !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] tabular-nums mt-2">
            {countdown.hours}h {countdown.minutes}m {countdown.seconds.toString().padStart(2, "0")}s
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{phase.tWeeks}</p>
        </div>
      </div>

      {/* Weekly focus */}
      <WeeklyFocusBar phase={phase} />

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
