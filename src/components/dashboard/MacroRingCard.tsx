"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import type { NutritionGoals } from "@/types";
import Link from "next/link";

interface MacroTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface MacroRingCardProps {
  totals: MacroTotals;
  goals: NutritionGoals | null;
}

export function MacroRingCard({ totals, goals }: MacroRingCardProps) {
  const g = goals ?? { calories_target: 2000, protein_g: 150, carbs_g: 200, fat_g: 65 };

  return (
    <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Nutrition Today</p>
        <Link href="/nutrition" className="text-xs text-[var(--color-accent)] hover:underline">Log food</Link>
      </div>

      {/* Calories */}
      <div className="text-center py-1">
        <span className="text-3xl font-bold">{Math.round(totals.calories)}</span>
        <span className="text-sm text-[var(--color-text-muted)] ml-1.5">/ {g.calories_target} kcal</span>
      </div>

      {/* Macros */}
      <div className="space-y-3">
        <ProgressBar
          value={totals.protein_g}
          max={g.protein_g}
          label="Protein"
          sublabel={`${Math.round(totals.protein_g)}g / ${g.protein_g}g`}
          color="blue"
        />
        <ProgressBar
          value={totals.carbs_g}
          max={g.carbs_g}
          label="Carbs"
          sublabel={`${Math.round(totals.carbs_g)}g / ${g.carbs_g}g`}
          color="orange"
        />
        <ProgressBar
          value={totals.fat_g}
          max={g.fat_g}
          label="Fat"
          sublabel={`${Math.round(totals.fat_g)}g / ${g.fat_g}g`}
          color="amber"
        />
      </div>
    </div>
  );
}
