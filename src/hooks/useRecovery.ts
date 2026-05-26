"use client";

import { createClient } from "@/lib/supabase/client";
import type { RecoveryLog } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { todayISO } from "@/lib/utils";
import { subDays, format } from "date-fns";

export function useRecovery(days = 14) {
  const [logs, setLogs] = useState<RecoveryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");
    const supabase = createClient();
    const { data } = await supabase
      .from("recovery_logs")
      .select("*")
      .gte("log_date", since)
      .order("log_date", { ascending: true });
    setLogs(data ?? []);
    setLoading(false);
  }, [days]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const todayLog = logs.find((l) => l.log_date === todayISO()) ?? null;

  const upsertLog = async (log: Omit<RecoveryLog, "id" | "user_id" | "created_at">) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("recovery_logs")
      .upsert(log, { onConflict: "user_id,log_date" })
      .select().single();
    if (!error && data) {
      setLogs((prev) => {
        const exists = prev.some((l) => l.log_date === data.log_date);
        return exists ? prev.map((l) => l.log_date === data.log_date ? data : l) : [...prev, data];
      });
    }
    return { data, error };
  };

  const avgEnergy = logs.length
    ? logs.reduce((sum, l) => sum + (l.energy ?? 0), 0) / logs.filter((l) => l.energy !== null).length
    : null;

  return { logs, todayLog, avgEnergy, loading, upsertLog, refetch: fetchLogs };
}
