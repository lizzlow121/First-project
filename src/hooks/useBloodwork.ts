"use client";

import { createClient } from "@/lib/supabase/client";
import type { BloodworkAnalysis } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useBloodwork() {
  const [analyses, setAnalyses] = useState<BloodworkAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyses = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("bloodwork_analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    setAnalyses(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const deleteAnalysis = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("bloodwork_analyses")
      .delete()
      .eq("id", id);
    if (!error) {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    }
    return { error };
  };

  return { analyses, loading, deleteAnalysis, refetch: fetchAnalyses };
}
