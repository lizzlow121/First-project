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
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { actual_finish_time_seconds, result_rating, result_notes, result_logged_at, share_slug, shared_at, ...insertData } = race;
    const { data, error } = await supabase.from("races").insert(insertData).select().single();
    if (!error && data) setRaces((prev) => [...prev, data].sort((a, b) => a.race_date.localeCompare(b.race_date)));
    return { data, error };
  };

  const updateRace = async (id: string, updates: Partial<Race>) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("races").update(updates).eq("id", id).select().single();
    if (!error && data) setRaces((prev) => prev.map((r) => (r.id === id ? data : r)));
    return { data, error };
  };

  const deleteRace = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("races").delete().eq("id", id);
    if (!error) setRaces((prev) => prev.filter((r) => r.id !== id));
    return { error };
  };

  const nextRace = races.find((r) => new Date(r.race_date) >= new Date()) ?? null;

  return { races, nextRace, loading, addRace, updateRace, deleteRace, refetch: fetchRaces };
}
