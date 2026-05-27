"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Loader2 } from "lucide-react";
import type { USDAFood, FoodLog, MealType } from "@/types";
import { todayISO } from "@/lib/utils";

interface FoodSearchModalProps {
  open: boolean;
  onClose: () => void;
  onAddFoodLog: (log: Omit<FoodLog, "id" | "user_id" | "created_at">) => Promise<void>;
  defaultMeal?: MealType;
}

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

export function FoodSearchModal({
  open,
  onClose,
  onAddFoodLog,
  defaultMeal = "breakfast",
}: FoodSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<USDAFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<USDAFood | null>(null);
  const [servingSize, setServingSize] = useState("100");
  const [mealType, setMealType] = useState<MealType>(defaultMeal);
  const [adding, setAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data);
    } catch {
      setSearchError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setSelected(null);
    setServingSize("100");
    setMealType(defaultMeal);
    setSearchError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setAdding(true);
    const scale = parseFloat(servingSize) / 100;
    await onAddFoodLog({
      log_date: todayISO(),
      meal_type: mealType,
      food_name: selected.description,
      brand: selected.brandOwner ?? null,
      serving_size_g: parseFloat(servingSize),
      calories: Math.round(selected.nutrients.calories * scale),
      protein_g: Math.round(selected.nutrients.protein_g * scale * 10) / 10,
      carbs_g: Math.round(selected.nutrients.carbs_g * scale * 10) / 10,
      fat_g: Math.round(selected.nutrients.fat_g * scale * 10) / 10,
      usda_fdc_id: String(selected.fdcId),
    });
    setAdding(false);
    handleClose();
  };

  const selectClass =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent)]";

  return (
    <Modal open={open} onClose={handleClose} title="Add food" className="max-w-lg">
      {selected ? (
        <div className="space-y-4">
          {/* Selected food */}
          <div
            className="rounded-xl p-4 border"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
            }}
          >
            <p className="text-sm font-semibold">{selected.description}</p>
            {selected.brandOwner && (
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {selected.brandOwner}
              </p>
            )}
            <div className="flex gap-4 mt-3">
              <div className="text-center">
                <p className="text-lg font-bold">{Math.round(selected.nutrients.calories)}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>cal/100g</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{selected.nutrients.protein_g.toFixed(1)}g</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>protein</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{selected.nutrients.carbs_g.toFixed(1)}g</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>carbs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{selected.nutrients.fat_g.toFixed(1)}g</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>fat</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Serving size (g)"
              id="serving"
              type="number"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Meal
              </label>
              <select
                className={selectClass}
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
              >
                {MEAL_TYPES.map((m) => (
                  <option key={m.value} value={m.value} style={{ background: "var(--color-surface-2)" }}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview totals */}
          {servingSize && parseFloat(servingSize) > 0 && (
            <div
              className="rounded-lg p-3 grid grid-cols-4 gap-2 text-center"
              style={{ background: "var(--color-surface-2)" }}
            >
              {[
                { label: "Cals", val: Math.round(selected.nutrients.calories * parseFloat(servingSize) / 100) },
                { label: "Protein", val: `${(selected.nutrients.protein_g * parseFloat(servingSize) / 100).toFixed(1)}g` },
                { label: "Carbs", val: `${(selected.nutrients.carbs_g * parseFloat(servingSize) / 100).toFixed(1)}g` },
                { label: "Fat", val: `${(selected.nutrients.fat_g * parseFloat(servingSize) / 100).toFixed(1)}g` },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-bold">{item.val}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSelected(null)} className="flex-1">
              Back
            </Button>
            <Button onClick={handleConfirm} loading={adding} className="flex-1">
              Add to log
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--color-text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search foods, e.g. chicken breast..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
              style={{ color: "var(--color-text-primary)" }}
            />
          </div>

          {searching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--color-text-muted)" }} />
              <span className="ml-2 text-sm" style={{ color: "var(--color-text-muted)" }}>Searching...</span>
            </div>
          )}

          {searchError && (
            <p className="text-sm" style={{ color: "var(--color-red)" }}>{searchError}</p>
          )}

          {!searching && results.length === 0 && query.trim() && !searchError && (
            <p className="text-sm text-center py-6" style={{ color: "var(--color-text-muted)" }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {!searching && results.length === 0 && !query.trim() && (
            <p className="text-sm text-center py-6" style={{ color: "var(--color-text-muted)" }}>
              Type to search the food database
            </p>
          )}

          <div className="space-y-1 max-h-80 overflow-y-auto">
            {results.map((food) => (
              <button
                key={food.fdcId}
                onClick={() => setSelected(food)}
                className="w-full text-left rounded-lg p-3 border transition-colors hover:border-[var(--color-accent)]"
                style={{
                  background: "var(--color-surface-2)",
                  borderColor: "var(--color-border)",
                }}
              >
                <p className="text-sm font-medium truncate">{food.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  {food.brandOwner && (
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {food.brandOwner}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {Math.round(food.nutrients.calories)} cal
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    P: {food.nutrients.protein_g.toFixed(1)}g · C: {food.nutrients.carbs_g.toFixed(1)}g · F: {food.nutrients.fat_g.toFixed(1)}g
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
