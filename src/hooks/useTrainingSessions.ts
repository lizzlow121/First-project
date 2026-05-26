"use client";

import { createClient } from "@/lib/supabase/client";
import type { TrainingSession } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { startOfWeek, endOfWeek, format } from "date-fns";

export function useTrainingSessions(weekOf?: Date) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = weekOf ? startOfWeek(weekOf, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const fetchSessions = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("training_sessions")
      .select("*")
      .gte("session_date", format(weekStart, "yyyy-MM-dd"))
      .lte("session_date", format(weekEnd, "yyyy-MM-dd"))
      .order("session_date", { ascending: true });
    setSessions(data ?? []);
    setLoading(false);
  }, [weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const addSession = async (session: Omit<TrainingSession, "id" | "user_id" | "created_at">) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("training_sessions").insert(session).select().single();
    if (!error && data) setSessions((prev) => [...prev, data].sort((a, b) => a.session_date.localeCompare(b.session_date)));
    return { data, error };
  };

  const updateSession = async (id: string, updates: Partial<TrainingSession>) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("training_sessions").update(updates).eq("id", id).select().single();
    if (!error && data) setSessions((prev) => prev.map((s) => (s.id === id ? data : s)));
    return { data, error };
  };

  const deleteSession = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("training_sessions").delete().eq("id", id);
    if (!error) setSessions((prev) => prev.filter((s) => s.id !== id));
    return { error };
  };

  return { sessions, loading, weekStart, weekEnd, addSession, updateSession, deleteSession, refetch: fetchSessions };
}

export function useAllSessions(limit = 20) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("training_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .limit(limit);
      setSessions(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [limit]);

  return { sessions, loading };
}
