"use client";

import { useState } from "react";
import { useNutrition } from "@/hooks/useNutrition";
import { useRaces } from "@/hooks/useRaces";
import { MacroProgressBars } from "@/components/nutrition/MacroProgressBars";
import { FoodSearchModal } from "@/components/nutrition/FoodSearchModal";
import { CarbLoadBanner, getCarbLoadedGoals, isInCarbLoadWindow } from "@/components/nutrition/CarbLoadBanner";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Plus, Trash2, Settings } from "lucide-react";
import type { MealType, FoodLog } from "@/types";
import Link from "next/link";

const MEALS: { type: MealType; label: string; emoji: string }[] = [
  { type: "breakfast", label: "Breakfast", emoji: "🌅" },
  { type: "lunch", label: "Lunch", emoji: "☀️" },
  { type: "dinner", label: "Dinner", emoji: "🌙" },
  { type: "snack", label: "Snack", emoji: "🍎" },
];

export default function NutritionPage() {
  const { foodLogs, goals, totals, loading, addFoodLog, deleteFoodLog } = useNutrition();
  const { nextRace } = useRaces();
  const effectiveGoals = goals && isInCarbLoadWindow(nextRace) ? getCarbLoadedGoals(goals) : goals;
  const [showSearch, setShowSearch] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>("breakfast");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = (meal: MealType) => {
    setActiveMeal(meal);
    setShowSearch(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteFoodLog(id);
    setDeletingId(null);
  };

  const mealLogs = (type: MealType) =>
    foodLogs.filter((l) => l.meal_type === type);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Nutrition</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Today&apos;s food log
          </p>
        </div>
        <Link href="/nutrition/goals">
          <Button variant="secondary" size="sm">
            <Settings className="h-4 w-4" />
            Goals
          </Button>
        </Link>
      </div>

      {/* Carb-load banner */}
      <CarbLoadBanner nextRace={nextRace} goals={goals} />

      {/* Macro totals */}
      {!loading && (
        <MacroProgressBars totals={totals} goals={effectiveGoals} />
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl animate-pulse"
              style={{ background: "var(--color-surface-1)" }}
            />
          ))}
        </div>
      )}

      {/* Meal sections */}
      {MEALS.map((meal) => {
        const logs = mealLogs(meal.type);
        const mealCalories = logs.reduce((s, l) => s + (l.calories ?? 0), 0);

        return (
          <Card key={meal.type}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {meal.label}
                  {mealCalories > 0 && (
                    <span
                      className="ml-2 normal-case font-normal text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {Math.round(mealCalories)} kcal
                    </span>
                  )}
                </CardTitle>
                <button
                  onClick={() => handleOpenAdd(meal.type)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-3)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {logs.length === 0 ? (
                <p
                  className="text-sm py-4 text-center"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Nothing logged yet
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <FoodLogItem
                      key={log.id}
                      log={log}
                      onDelete={() => handleDelete(log.id)}
                      deleting={deletingId === log.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Food search modal */}
      <FoodSearchModal
        open={showSearch}
        onClose={() => setShowSearch(false)}
        onAddFoodLog={async (log) => { await addFoodLog(log); }}
        defaultMeal={activeMeal}
      />
    </div>
  );
}

function FoodLogItem({
  log,
  onDelete,
  deleting,
}: {
  log: FoodLog;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 py-2 border-b last:border-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{log.food_name}</p>
        <div className="flex gap-3 mt-0.5">
          {log.serving_size_g && (
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {log.serving_size_g}g
            </span>
          )}
          {log.protein_g != null && (
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              P: {log.protein_g}g
            </span>
          )}
          {log.carbs_g != null && (
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              C: {log.carbs_g}g
            </span>
          )}
          {log.fat_g != null && (
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              F: {log.fat_g}g
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {log.calories != null && (
          <span
            className="text-sm font-semibold tabular-nums"
            style={{ color: "var(--color-text-primary)" }}
          >
            {Math.round(log.calories)}
          </span>
        )}
        <button
          onClick={onDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface-3)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
