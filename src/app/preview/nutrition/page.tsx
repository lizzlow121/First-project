import { MacroProgressBars } from "@/components/nutrition/MacroProgressBars";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Settings, Flame } from "lucide-react";

export default function PreviewNutrition() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Nutrition</h1>
            <p className="text-sm mt-0.5 text-[var(--color-text-secondary)]">Today&apos;s food log</p>
          </div>
          <Button variant="secondary" size="sm"><Settings className="h-4 w-4" /> Goals</Button>
        </div>

        {/* Carb load banner */}
        <div className="rounded-xl border border-[var(--color-orange)]/30 bg-[var(--color-orange-dim)]/30 p-4 flex items-start gap-3">
          <div className="rounded-lg bg-[var(--color-orange)]/20 p-2 shrink-0">
            <Flame className="h-4 w-4 text-[var(--color-orange)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Carb-load mode active</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Hyrox London is in 2 days. Adjusted targets: <span className="font-medium">375g carbs</span>, <span className="font-medium">49g fat</span>, <span className="font-medium">2640 kcal</span>
            </p>
          </div>
        </div>

        <MacroProgressBars
          totals={{ calories: 1840, protein_g: 142, carbs_g: 245, fat_g: 38 }}
          goals={{ id: "", user_id: "", calories_target: 2640, protein_g: 180, carbs_g: 375, fat_g: 49, updated_at: "" }}
        />

        {[
          { label: "Breakfast", emoji: "🌅", cal: 520, items: [
            { name: "Oats with banana & honey", servings: "100g", p: 12, c: 88, f: 6, cal: 460 },
            { name: "Black coffee", servings: "240ml", p: 0, c: 0, f: 0, cal: 5 },
          ]},
          { label: "Lunch", emoji: "☀️", cal: 720, items: [
            { name: "Chicken breast, grilled", servings: "180g", p: 56, c: 0, f: 7, cal: 297 },
            { name: "Brown rice, cooked", servings: "250g", p: 6, c: 56, f: 2, cal: 270 },
            { name: "Steamed broccoli", servings: "120g", p: 3, c: 7, f: 0.4, cal: 40 },
          ]},
          { label: "Dinner", emoji: "🌙", cal: 0, items: [] },
          { label: "Snack", emoji: "🍎", cal: 600, items: [
            { name: "Greek yoghurt with berries", servings: "200g", p: 18, c: 22, f: 5, cal: 195 },
            { name: "Almonds", servings: "30g", p: 6, c: 6, f: 16, cal: 174 },
          ]},
        ].map((meal) => (
          <Card key={meal.label}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {meal.label}
                  {meal.cal > 0 && (
                    <span className="ml-2 normal-case font-normal text-xs text-[var(--color-text-muted)]">{meal.cal} kcal</span>
                  )}
                </CardTitle>
                <button className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)]">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {meal.items.length === 0 ? (
                <p className="text-sm py-4 text-center text-[var(--color-text-muted)]">Nothing logged yet</p>
              ) : (
                <div className="space-y-2">
                  {meal.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{it.name}</p>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-xs text-[var(--color-text-muted)]">{it.servings}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">P: {it.p}g</span>
                          <span className="text-xs text-[var(--color-text-muted)]">C: {it.c}g</span>
                          <span className="text-xs text-[var(--color-text-muted)]">F: {it.f}g</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{it.cal}</span>
                      <button className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)]">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
