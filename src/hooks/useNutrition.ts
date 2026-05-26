"use client";

import { createClient } from "@/lib/supabase/client";
import type { FoodLog, NutritionGoals } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { todayISO } from "@/lib/utils";

export function useNutrition(date?: string) {
  const logDate = date ?? todayISO();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [logsRes, goalsRes] = await Promise.all([
      supabase.from("food_logs").select("*").eq("log_date", logDate).order("created_at"),
      supabase.from("nutrition_goals").select("*").single(),
    ]);
    setFoodLogs(logsRes.data ?? []);
    setGoals(goalsRes.data ?? null);
    setLoading(false);
  }, [logDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories ?? 0),
      protein_g: acc.protein_g + (log.protein_g ?? 0),
      carbs_g: acc.carbs_g + (log.carbs_g ?? 0),
      fat_g: acc.fat_g + (log.fat_g ?? 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const addFoodLog = async (log: Omit<FoodLog, "id" | "user_id" | "created_at">) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("food_logs").insert(log).select().single();
    if (!error && data) setFoodLogs((prev) => [...prev, data]);
    return { data, error };
  };

  const deleteFoodLog = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("food_logs").delete().eq("id", id);
    if (!error) setFoodLogs((prev) => prev.filter((l) => l.id !== id));
    return { error };
  };

  const saveGoals = async (g: Omit<NutritionGoals, "id" | "user_id" | "updated_at">) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("nutrition_goals")
      .upsert({ ...g, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
      .select().single();
    if (!error && data) setGoals(data);
    return { data, error };
  };

  return { foodLogs, goals, totals, loading, addFoodLog, deleteFoodLog, saveGoals, refetch: fetchData };
}
