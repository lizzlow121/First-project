"use client";

import type { RacePhase } from "@/lib/race-phase";
import { ArrowRight } from "lucide-react";

const ACCENT_STYLES: Record<RacePhase["accent"], { bg: string; text: string; pill: string }> = {
  blue: {
    bg: "from-[var(--color-accent-dim)]/40 to-transparent",
    text: "text-[var(--color-accent)]",
    pill: "bg-[var(--color-accent-dim)] text-[var(--color-accent)]",
  },
  amber: {
    bg: "from-[var(--color-amber-dim)]/40 to-transparent",
    text: "text-[var(--color-amber)]",
    pill: "bg-[var(--color-amber-dim)] text-[var(--color-amber)]",
  },
  orange: {
    bg: "from-[var(--color-orange-dim)]/40 to-transparent",
    text: "text-[var(--color-orange)]",
    pill: "bg-[var(--color-orange-dim)] text-[var(--color-orange)]",
  },
  red: {
    bg: "from-[var(--color-red-dim)]/40 to-transparent",
    text: "text-[var(--color-red)]",
    pill: "bg-[var(--color-red-dim)] text-[var(--color-red)]",
  },
  green: {
    bg: "from-[var(--color-green-dim)]/40 to-transparent",
    text: "text-[var(--color-green)]",
    pill: "bg-[var(--color-green-dim)] text-[var(--color-green)]",
  },
  gray: {
    bg: "from-[var(--color-surface-3)]/40 to-transparent",
    text: "text-[var(--color-text-secondary)]",
    pill: "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]",
  },
};

export function WeeklyFocusBar({ phase }: { phase: RacePhase }) {
  const style = ACCENT_STYLES[phase.accent];

  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-gradient-to-r ${style.bg} p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${style.pill}`}>
          {phase.tWeeks}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">·</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.text}`}>
          {phase.phase} Phase
        </span>
      </div>
      <div className="flex items-start gap-2">
        <ArrowRight className={`h-4 w-4 mt-0.5 shrink-0 ${style.text}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{phase.focus}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
            {phase.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
