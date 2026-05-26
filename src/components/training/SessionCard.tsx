"use client";

import { cn, sessionTypeColor, effortColor, formatDuration } from "@/lib/utils";
import type { TrainingSession } from "@/types";

interface SessionCardProps {
  session: TrainingSession;
  onClick?: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg p-2.5 border transition-colors",
        "hover:bg-[var(--color-surface-3)]"
      )}
      style={{
        background: "var(--color-surface-2)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{
            background: sessionTypeColor(session.session_type).replace(
              "bg-",
              ""
            ),
          }}
        />
        <p className="text-xs font-medium truncate leading-tight">
          {session.title}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {session.duration_minutes && (
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            {formatDuration(session.duration_minutes)}
          </span>
        )}
        {session.distance_km && (
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            {session.distance_km}km
          </span>
        )}
        {session.perceived_effort && (
          <span
            className={cn("text-xs font-medium", effortColor(session.perceived_effort))}
          >
            RPE {session.perceived_effort}
          </span>
        )}
      </div>
    </button>
  );
}

// Colored dot version using CSS class approach
export function SessionDot({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    run: "var(--color-accent)",
    ride: "#06b6d4",
    swim: "#38bdf8",
    strength: "var(--color-orange)",
    hyrox: "var(--color-amber)",
    ocr: "var(--color-green)",
    yoga: "#a78bfa",
    rest: "var(--color-text-muted)",
    other: "var(--color-text-muted)",
  };
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: colorMap[type] ?? colorMap.other }}
    />
  );
}
