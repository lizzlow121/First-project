"use client";

import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { todayISO } from "@/lib/utils";

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const today = todayISO();

  const fetchEntries = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .limit(30);
    setEntries(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const todayMorning = entries.find((e) => e.entry_date === today && e.entry_type === "morning") ?? null;
  const todayEvening = entries.find((e) => e.entry_date === today && e.entry_type === "evening") ?? null;

  const upsertEntry = async (entry: Omit<JournalEntry, "id" | "user_id" | "created_at" | "updated_at">) => {
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: { message: json.error } };
    setEntries((prev) => {
      const exists = prev.some((e) => e.entry_date === json.entry_date && e.entry_type === json.entry_type);
      return exists
        ? prev.map((e) => e.entry_date === json.entry_date && e.entry_type === json.entry_type ? json : e)
        : [json, ...prev];
    });
    return { data: json, error: null };
  };

  return { entries, todayMorning, todayEvening, loading, upsertEntry, refetch: fetchEntries };
}
