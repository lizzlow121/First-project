import { ProgressBar } from "@/components/ui/ProgressBar";

interface MacroTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface MacroGoals {
  calories_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface MacroProgressBarsProps {
  totals: MacroTotals;
  goals: MacroGoals | null;
}

export function MacroProgressBars({ totals, goals }: MacroProgressBarsProps) {
  const calTarget = goals?.calories_target ?? 2000;
  const proteinTarget = goals?.protein_g ?? 150;
  const carbsTarget = goals?.carbs_g ?? 250;
  const fatTarget = goals?.fat_g ?? 70;

  const macros = [
    {
      label: "Calories",
      value: Math.round(totals.calories),
      max: calTarget,
      unit: "kcal",
      color: "blue" as const,
    },
    {
      label: "Protein",
      value: Math.round(totals.protein_g),
      max: proteinTarget,
      unit: "g",
      color: "orange" as const,
    },
    {
      label: "Carbs",
      value: Math.round(totals.carbs_g),
      max: carbsTarget,
      unit: "g",
      color: "amber" as const,
    },
    {
      label: "Fat",
      value: Math.round(totals.fat_g),
      max: fatTarget,
      unit: "g",
      color: "green" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {macros.map((m) => (
        <div
          key={m.label}
          className="rounded-xl p-4 border"
          style={{
            background: "var(--color-surface-1)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              {m.label}
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {m.value}/{m.max}{m.unit}
            </span>
          </div>
          <p className="text-xl font-bold tabular-nums mb-2">
            {m.value}
            <span className="text-sm font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>
              {m.unit}
            </span>
          </p>
          <ProgressBar value={m.value} max={m.max} color={m.color} />
        </div>
      ))}
    </div>
  );
}
