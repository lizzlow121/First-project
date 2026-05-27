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
    const res = await fetch("/api/training-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: { message: json.error } };
    setSessions((prev) => [...prev, json].sort((a, b) => a.session_date.localeCompare(b.session_date)));
    return { data: json, error: null };
  };

  const updateSession = async (id: string, updates: Partial<TrainingSession>) => {
    const res = await fetch("/api/training-sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: { message: json.error } };
    setSessions((prev) => prev.map((s) => (s.id === id ? json : s)));
    return { data: json, error: null };
  };

  const deleteSession = async (id: string) => {
    const res = await fetch("/api/training-sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (!res.ok) return { error: { message: json.error } };
    setSessions((prev) => prev.filter((s) => s.id !== id));
    return { error: null };
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
