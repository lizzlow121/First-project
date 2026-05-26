"use client";

import { createClient } from "@/lib/supabase/client";
import type { Supplement, SupplementLog } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { todayISO } from "@/lib/utils";

export function useSupplements() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [todayLogs, setTodayLogs] = useState<SupplementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const today = todayISO();

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [supRes, logRes] = await Promise.all([
      supabase.from("supplements").select("*").eq("active", true).order("created_at"),
      supabase.from("supplement_logs").select("*").eq("taken_date", today),
    ]);
    setSupplements(supRes.data ?? []);
    setTodayLogs(logRes.data ?? []);
    setLoading(false);
  }, [today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isTaken = (supplementId: string) => todayLogs.some((l) => l.supplement_id === supplementId);

  const toggleSupplement = async (supplementId: string) => {
    const supabase = createClient();
    const alreadyTaken = isTaken(supplementId);
    if (alreadyTaken) {
      const { error } = await supabase
        .from("supplement_logs")
        .delete()
        .eq("supplement_id", supplementId)
        .eq("taken_date", today);
      if (!error) setTodayLogs((prev) => prev.filter((l) => l.supplement_id !== supplementId));
    } else {
      const { data, error } = await supabase
        .from("supplement_logs")
        .insert({ supplement_id: supplementId, taken_date: today })
        .select().single();
      if (!error && data) setTodayLogs((prev) => [...prev, data]);
    }
  };

  const addSupplement = async (s: Omit<Supplement, "id" | "user_id" | "created_at" | "active">) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("supplements").insert({ ...s, active: true }).select().single();
    if (!error && data) setSupplements((prev) => [...prev, data]);
    return { data, error };
  };

  const deactivateSupplement = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("supplements").update({ active: false }).eq("id", id);
    if (!error) setSupplements((prev) => prev.filter((s) => s.id !== id));
    return { error };
  };

  const takenCount = todayLogs.length;
  const totalCount = supplements.length;

  return { supplements, todayLogs, isTaken, toggleSupplement, addSupplement, deactivateSupplement, takenCount, totalCount, loading, refetch: fetchData };
}
