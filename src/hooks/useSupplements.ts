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
    const alreadyTaken = isTaken(supplementId);
    if (alreadyTaken) {
      const res = await fetch("/api/supplement-logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplement_id: supplementId, taken_date: today }),
      });
      if (res.ok) setTodayLogs((prev) => prev.filter((l) => l.supplement_id !== supplementId));
    } else {
      const res = await fetch("/api/supplement-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplement_id: supplementId, taken_date: today }),
      });
      const json = await res.json();
      if (res.ok && json) setTodayLogs((prev) => [...prev, json]);
    }
  };

  const addSupplement = async (s: Omit<Supplement, "id" | "user_id" | "created_at" | "active">) => {
    const res = await fetch("/api/supplements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: { message: json.error } };
    setSupplements((prev) => [...prev, json]);
    return { data: json, error: null };
  };

  const deactivateSupplement = async (id: string) => {
    const res = await fetch("/api/supplements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: false }),
    });
    const json = await res.json();
    if (!res.ok) return { error: { message: json.error } };
    setSupplements((prev) => prev.filter((s) => s.id !== id));
    return { error: null };
  };

  const takenCount = todayLogs.length;
  const totalCount = supplements.length;

  return { supplements, todayLogs, isTaken, toggleSupplement, addSupplement, deactivateSupplement, takenCount, totalCount, loading, refetch: fetchData };
}
