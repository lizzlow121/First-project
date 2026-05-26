"use client";

import { format, addDays, isSameDay, isToday } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { SessionCard } from "./SessionCard";
import type { TrainingSession } from "@/types";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekCalendarProps {
  weekStart: Date;
  sessions: TrainingSession[];
  onAddSession: (date: string) => void;
  onEditSession: (session: TrainingSession) => void;
  onDeleteSession: (id: string) => void;
}

export function WeekCalendar({
  weekStart,
  sessions,
  onAddSession,
  onEditSession,
  onDeleteSession,
}: WeekCalendarProps) {
  const [popoverId, setPopoverId] = useState<string | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-7 gap-2 min-h-[400px]">
      {days.map((day, dayIdx) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const daySessions = sessions.filter((s) => s.session_date === dateStr);
        const isCurrentDay = isToday(day);

        return (
          <div
            key={dateStr}
            className={cn(
              "flex flex-col rounded-xl border min-h-[200px]",
              isCurrentDay ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"
            )}
            style={{
              background: isCurrentDay
                ? "var(--color-accent-dim)"
                : "var(--color-surface-1)",
            }}
          >
            {/* Day header */}
            <div
              className={cn(
                "px-2 pt-2.5 pb-2 text-center border-b",
                isCurrentDay
                  ? "border-[var(--color-accent)]"
                  : "border-[var(--color-border)]"
              )}
            >
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{
                  color: isCurrentDay
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                }}
              >
                {DAY_LABELS[dayIdx]}
              </p>
              <p
                className={cn(
                  "text-base font-bold tabular-nums mt-0.5",
                  isCurrentDay ? "" : ""
                )}
                style={{
                  color: isCurrentDay
                    ? "var(--color-accent)"
                    : "var(--color-text-primary)",
                }}
              >
                {format(day, "d")}
              </p>
            </div>

            {/* Sessions */}
            <div className="flex-1 p-1.5 space-y-1.5 overflow-hidden">
              {daySessions.map((session) => (
                <div key={session.id} className="relative">
                  <SessionCard
                    session={session}
                    onClick={() =>
                      setPopoverId((prev) =>
                        prev === session.id ? null : session.id
                      )
                    }
                  />
                  {popoverId === session.id && (
                    <div
                      className="absolute z-20 top-full left-0 mt-1 rounded-lg border shadow-xl p-1 flex gap-1 w-max"
                      style={{
                        background: "var(--color-surface-2)",
                        borderColor: "var(--color-border-light)",
                      }}
                    >
                      <button
                        onClick={() => {
                          setPopoverId(null);
                          onEditSession(session);
                        }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md hover:bg-[var(--color-surface-3)] transition-colors"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setPopoverId(null);
                          onDeleteSession(session.id);
                        }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md hover:bg-[var(--color-red-dim)] transition-colors"
                        style={{ color: "var(--color-red)" }}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add button */}
            <div className="p-1.5 pt-0">
              <button
                onClick={() => onAddSession(dateStr)}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-colors hover:bg-[var(--color-surface-3)]"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
