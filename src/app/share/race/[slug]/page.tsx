import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Race } from "@/types";
import { formatGoalTime, weeksUntil } from "@/lib/utils";
import { Trophy, MapPin, Calendar, Target, Zap } from "lucide-react";
import { format } from "date-fns";
import type { Metadata } from "next";
import { ShareCountdown } from "./ShareCountdown";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getRace(slug: string): Promise<Race | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("races")
    .select("*")
    .eq("share_slug", slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const race = await getRace(slug);
  if (!race) return { title: "Race not found" };
  const weeks = weeksUntil(race.race_date);
  const goal = race.goal_time_seconds ? ` · Goal ${formatGoalTime(race.goal_time_seconds)}` : "";
  return {
    title: `${race.name} — ${weeks} weeks to go`,
    description: `Training toward ${race.name}${goal}`,
  };
}

export default async function SharedRacePage({ params }: PageProps) {
  const { slug } = await params;
  const race = await getRace(slug);
  if (!race) notFound();

  const isPast = new Date(race.race_date) < new Date();
  const beatGoal =
    race.actual_finish_time_seconds !== null &&
    race.goal_time_seconds !== null &&
    race.actual_finish_time_seconds <= race.goal_time_seconds;

  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] flex flex-col">
      {/* Brand bar */}
      <header className="border-b border-[var(--color-border)] px-6 py-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold">Athlete HQ</span>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-3xl bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-surface-2)] border border-[var(--color-border-light)] p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            <Trophy className="h-3.5 w-3.5" />
            {isPast ? "Race result" : "Training toward"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{race.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)] mb-6">
            {race.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {race.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(race.race_date), "MMM d, yyyy")}
            </span>
          </div>

          {/* Countdown OR Result */}
          {isPast && race.actual_finish_time_seconds ? (
            <div className="rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-6 space-y-3">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Finish time</p>
              <p className="text-5xl font-bold tabular-nums">
                {formatGoalTime(race.actual_finish_time_seconds)}
              </p>
              {race.goal_time_seconds && (
                <p
                  className="text-sm font-medium"
                  style={{ color: beatGoal ? "var(--color-green)" : "var(--color-amber)" }}
                >
                  {beatGoal ? "Beat goal by " : "Off goal by "}
                  {formatGoalTime(
                    Math.abs(race.actual_finish_time_seconds - race.goal_time_seconds)
                  )}
                </p>
              )}
            </div>
          ) : (
            <ShareCountdown raceDate={race.race_date} />
          )}

          {/* Goal time (if upcoming) */}
          {!isPast && race.goal_time_seconds && (
            <div className="mt-6 flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-[var(--color-orange)]" />
              <span className="text-[var(--color-text-secondary)]">Goal time:</span>
              <span className="font-semibold tabular-nums">
                {formatGoalTime(race.goal_time_seconds)}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="border-t border-[var(--color-border)] px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-[var(--color-text-muted)]">
          Training toward your own race? Track everything in one place.
        </p>
        <a
          href="/signup"
          className="text-xs font-medium text-[var(--color-accent)] hover:underline"
        >
          Try Athlete HQ →
        </a>
      </footer>
    </div>
  );
}
