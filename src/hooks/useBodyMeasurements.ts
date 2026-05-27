"use client";

import { createClient } from "@/lib/supabase/client";
import type { BodyMeasurement } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useBodyMeasurements() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("body_measurements")
      .select("*")
      .order("log_date", { ascending: false })
      .limit(60);
    setMeasurements(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const latest = measurements[0] ?? null;

  const upsertMeasurement = async (m: Omit<BodyMeasurement, "id" | "user_id" | "created_at">) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("body_measurements")
      .upsert(m, { onConflict: "user_id,log_date" })
      .select().single();
    if (!error && data) {
      setMeasurements((prev) => {
        const exists = prev.some((x) => x.log_date === data.log_date);
        return exists
          ? prev.map((x) => x.log_date === data.log_date ? data : x)
          : [data, ...prev];
      });
    }
    return { data, error };
  };

  return { measurements, latest, loading, upsertMeasurement, refetch: fetchData };
}
