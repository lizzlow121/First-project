"use client";

import type { Race, NutritionGoals } from "@/types";
import { Flame } from "lucide-react";
import { weeksUntil } from "@/lib/utils";

interface CarbLoadBannerProps {
  nextRace: Race | null;
  goals: NutritionGoals | null;
}

export function getCarbLoadedGoals(goals: NutritionGoals): NutritionGoals {
  return {
    ...goals,
    carbs_g: Math.round(goals.carbs_g * 1.5),
    fat_g: Math.round(goals.fat_g * 0.7),
    calories_target: Math.round(goals.calories_target * 1.1),
  };
}

export function isInCarbLoadWindow(race: Race | null): boolean {
  if (!race) return false;
  const daysToRace = Math.ceil(
    (new Date(race.race_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysToRace >= 0 && daysToRace <= 3;
}

export function CarbLoadBanner({ nextRace, goals }: CarbLoadBannerProps) {
  if (!nextRace || !goals || !isInCarbLoadWindow(nextRace)) return null;

  const daysToRace = Math.ceil(
    (new Date(nextRace.race_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const loadedGoals = getCarbLoadedGoals(goals);

  return (
    <div className="rounded-xl border border-[var(--color-orange)]/30 bg-[var(--color-orange-dim)]/30 p-4 flex items-start gap-3">
      <div className="rounded-lg bg-[var(--color-orange)]/20 p-2 shrink-0">
        <Flame className="h-4 w-4 text-[var(--color-orange)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          Carb-load mode active
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          {nextRace.name} is in {daysToRace} day{daysToRace !== 1 ? "s" : ""}. Adjusted targets: {" "}
          <span className="font-medium">{loadedGoals.carbs_g}g carbs</span>,{" "}
          <span className="font-medium">{loadedGoals.fat_g}g fat</span>,{" "}
          <span className="font-medium">{loadedGoals.calories_target} kcal</span>
        </p>
      </div>
    </div>
  );
}
