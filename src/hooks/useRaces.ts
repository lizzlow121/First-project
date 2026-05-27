"use client";

import { createClient } from "@/lib/supabase/client";
import type { Race } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useRaces() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRaces = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("races")
      .select("*")
      .order("race_date", { ascending: true });
    setRaces(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRaces(); }, [fetchRaces]);

  const addRace = async (race: Omit<Race, "id" | "user_id" | "created_at">) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { actual_finish_time_seconds, result_rating, result_notes, result_logged_at, share_slug, shared_at, ...insertData } = race;
    const res = await fetch("/api/races", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(insertData),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: { message: json.error } };
    setRaces((prev) => [...prev, json].sort((a, b) => a.race_date.localeCompare(b.race_date)));
    return { data: json, error: null };
  };

  const updateRace = async (id: string, updates: Partial<Race>) => {
    const res = await fetch("/api/races", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: { message: json.error } };
    setRaces((prev) => prev.map((r) => (r.id === id ? json : r)));
    return { data: json, error: null };
  };

  const deleteRace = async (id: string) => {
    const res = await fetch("/api/races", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (!res.ok) return { error: { message: json.error } };
    setRaces((prev) => prev.filter((r) => r.id !== id));
    return { error: null };
  };

  const nextRace = races.find((r) => new Date(r.race_date) >= new Date()) ?? null;

  return { races, nextRace, loading, addRace, updateRace, deleteRace, refetch: fetchRaces };
}
