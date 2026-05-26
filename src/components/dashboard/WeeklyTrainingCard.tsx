"use client";

import type { TrainingSession } from "@/types";
import { sessionTypeColor, cn } from "@/lib/utils";
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import Link from "next/link";

interface WeeklyTrainingCardProps {
  sessions: TrainingSession[];
}

export function WeeklyTrainingCard({ sessions }: WeeklyTrainingCardProps) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const sessionsByDate = sessions.reduce<Record<string, TrainingSession[]>>((acc, s) => {
    acc[s.session_date] = acc[s.session_date] ?? [];
    acc[s.session_date].push(s);
    return acc;
  }, {});

  return (
    <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">This Week</p>
        <Link href="/training" className="text-xs text-[var(--color-accent)] hover:underline">View plan</Link>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const daySessions = sessionsByDate[key] ?? [];
          const isToday = key === format(today, "yyyy-MM-dd");
          const isPast = day < today && !isToday;

          return (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <span className={cn(
                "text-[10px] font-medium",
                isToday ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"
              )}>
                {format(day, "EEE")[0]}
              </span>
              <div className={cn(
                "w-8 h-8 rounded-lg flex flex-col items-center justify-center gap-0.5 overflow-hidden",
                isToday ? "ring-1 ring-[var(--color-accent)]" : "",
                daySessions.length === 0 ? "bg-[var(--color-surface-3)]" : "bg-[var(--color-surface-2)]"
              )}>
                {daySessions.length === 0 && (
                  <span className={cn("w-1.5 h-1.5 rounded-full", isPast ? "bg-[var(--color-text-muted)]/30" : "bg-[var(--color-surface-3)]")} />
                )}
                {daySessions.slice(0, 2).map((s, i) => (
                  <span key={i} className={cn("w-4 h-1.5 rounded-full", sessionTypeColor(s.session_type))} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {sessions.length > 0 && (
        <p className="text-xs text-[var(--color-text-muted)]">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} this week
        </p>
      )}
      {sessions.length === 0 && (
        <p className="text-xs text-[var(--color-text-muted)]">No sessions logged yet this week</p>
      )}
    </div>
  );
}
