"use client";

import { useHydration } from "@/hooks/useHydration";
import { Droplets, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_ADDS = [
  { label: "250ml", ml: 250 },
  { label: "500ml", ml: 500 },
  { label: "750ml", ml: 750 },
];

export function HydrationCard() {
  const { totalMl, goal, addWater, loading } = useHydration();
  const pct = goal > 0 ? Math.min(100, (totalMl / goal) * 100) : 0;
  const litres = (totalMl / 1000).toFixed(2);
  const goalLitres = (goal / 1000).toFixed(1);

  return (
    <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          <Droplets className="h-3 w-3" />
          Hydration
        </div>
        <span className="text-xs text-[var(--color-text-secondary)] tabular-nums">{Math.round(pct)}%</span>
      </div>

      {/* Progress visual */}
      <div className="space-y-2">
        <div className="text-center py-1">
          <span className="text-3xl font-bold tabular-nums">{litres}L</span>
          <span className="text-sm text-[var(--color-text-muted)] ml-1.5">/ {goalLitres}L</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--color-surface-3)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-2">
        {QUICK_ADDS.map(({ label, ml }) => (
          <button
            key={label}
            onClick={() => addWater(ml)}
            disabled={loading}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)] transition-colors"
            )}
          >
            <Plus className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
