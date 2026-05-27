"use client";

import { createClient } from "@/lib/supabase/client";
import type { WeightLog } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";

export type WeightTrend = "up" | "down" | "stable" | null;

export function useWeightLogs(days = 30) {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");
    const supabase = createClient();
    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .gte("log_date", since)
      .order("log_date", { ascending: false });
    setLogs(data ?? []);
    setLoading(false);
  }, [days]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(
    async (weight_kg: number, notes?: string) => {
      const supabase = createClient();
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("weight_logs")
        .upsert(
          { log_date: today, weight_kg, notes: notes ?? null },
          { onConflict: "user_id,log_date" }
        )
        .select()
        .single();
      if (!error && data) {
        setLogs((prev) => {
          const exists = prev.some((l) => l.log_date === data.log_date);
          return exists
            ? prev.map((l) => (l.log_date === data.log_date ? data : l))
            : [data, ...prev];
        });
      }
      return { data, error };
    },
    []
  );

  const deleteLog = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("weight_logs").delete().eq("id", id);
    if (!error) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
    return { error };
  }, []);

  const trend = useMemo<WeightTrend>(() => {
    // Logs are ordered desc; we need chronological order for slicing
    const chronological = [...logs].sort((a, b) =>
      a.log_date.localeCompare(b.log_date)
    );
    const last7 = chronological.slice(-7);
    const prev7 = chronological.slice(-14, -7);

    if (last7.length < 2 || prev7.length < 1) return null;

    const avg = (arr: WeightLog[]) =>
      arr.reduce((s, l) => s + l.weight_kg, 0) / arr.length;

    const recentAvg = avg(last7);
    const previousAvg = avg(prev7);
    const diff = recentAvg - previousAvg;

    if (Math.abs(diff) < 0.2) return "stable";
    return diff > 0 ? "up" : "down";
  }, [logs]);

  return { logs, loading, addLog, deleteLog, trend };
}
