"use client";

import { useState } from "react";
import { useJournal } from "@/hooks/useJournal";
import { todayISO } from "@/lib/utils";

export function DailyJournalCard() {
  const { todayMorning, todayEvening, loading, upsertEntry } = useJournal();
  const [intention, setIntention] = useState("");
  const [reflection, setReflection] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [saving, setSaving] = useState(false);

  const hour = new Date().getHours();
  const isMorning = hour < 12;
  const isEvening = hour >= 18;
  const today = todayISO();

  const handleSaveMorning = async () => {
    if (!intention.trim()) return;
    setSaving(true);
    await upsertEntry({
      entry_date: today,
      entry_type: "morning",
      intention: intention.trim(),
      content: null,
      ai_prompts: null,
    });
    setSaving(false);
    setIntention("");
  };

  const handleGetPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const res = await fetch("/api/journal/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions: [],
          raceName: null,
          daysToRace: null,
          recoveryScore: null,
          energyLevel: null,
          morningIntention: todayMorning?.intention ?? null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPrompts(data.prompts ?? []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleSaveEvening = async () => {
    if (!reflection.trim()) return;
    setSaving(true);
    await upsertEntry({
      entry_date: today,
      entry_type: "evening",
      intention: null,
      content: reflection.trim(),
      ai_prompts: prompts.length > 0 ? prompts : null,
    });
    setSaving(false);
    setReflection("");
    setPrompts([]);
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-4">
        <div className="h-4 w-32 rounded bg-[var(--color-surface-3)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-4 flex flex-col gap-3">
      <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
        Daily Journal
      </span>

      {/* Morning block */}
      {isMorning && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Morning check-in
          </p>
          {todayMorning ? (
            <p className="text-sm text-[var(--color-text-primary)]">
              <span className="text-[var(--color-green)] mr-1">&#10003;</span>
              Intention set:{" "}
              <span className="italic">{todayMorning.intention}</span>
            </p>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Set your intention for today…"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <button
                onClick={handleSaveMorning}
                disabled={saving || !intention.trim()}
                className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Evening block */}
      {isEvening && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Evening reflection
          </p>
          {todayEvening ? (
            <p className="text-sm text-[var(--color-text-primary)]">
              <span className="text-[var(--color-green)] mr-1">&#10003;</span>
              Reflection logged
            </p>
          ) : (
            <div className="space-y-2">
              {prompts.length > 0 && (
                <ul className="space-y-1">
                  {prompts.map((p, i) => (
                    <li
                      key={i}
                      className="text-xs text-[var(--color-text-muted)] italic"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              <textarea
                placeholder="How did your day go?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleGetPrompts}
                  disabled={loadingPrompts}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] disabled:opacity-50 transition-colors"
                >
                  {loadingPrompts ? "Loading…" : "Get prompts"}
                </button>
                <button
                  onClick={handleSaveEvening}
                  disabled={saving || !reflection.trim()}
                  className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Between noon and 6pm: compact view */}
      {!isMorning && !isEvening && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Today&apos;s focus
          </p>
          {todayMorning?.intention ? (
            <p className="text-sm text-[var(--color-text-primary)] italic">
              &ldquo;{todayMorning.intention}&rdquo;
            </p>
          ) : todayEvening ? (
            <p className="text-sm text-[var(--color-text-primary)]">
              <span className="text-[var(--color-green)] mr-1">&#10003;</span>
              Reflection logged
            </p>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              No entries yet today
            </p>
          )}
        </div>
      )}
    </div>
  );
}
