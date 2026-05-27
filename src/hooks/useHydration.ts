"use client";

import { createClient } from "@/lib/supabase/client";
import type { HydrationLog } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { todayISO } from "@/lib/utils";

export function useHydration(date?: string) {
  const logDate = date ?? todayISO();
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [goal, setGoal] = useState(3000);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [logsRes, profileRes] = await Promise.all([
      supabase.from("hydration_logs").select("*").eq("log_date", logDate).order("logged_at"),
      supabase.from("profiles").select("hydration_goal_ml").single(),
    ]);
    setLogs(logsRes.data ?? []);
    if (profileRes.data?.hydration_goal_ml) setGoal(profileRes.data.hydration_goal_ml);
    setLoading(false);
  }, [logDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);

  const addWater = async (amount_ml: number) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("hydration_logs")
      .insert({ log_date: logDate, amount_ml })
      .select().single();
    if (!error && data) setLogs((prev) => [...prev, data]);
    return { data, error };
  };

  const deleteLog = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("hydration_logs").delete().eq("id", id);
    if (!error) setLogs((prev) => prev.filter((l) => l.id !== id));
    return { error };
  };

  return { logs, totalMl, goal, loading, addWater, deleteLog, refetch: fetchData };
}
