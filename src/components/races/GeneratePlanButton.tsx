"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";
import type { Race } from "@/types";
import { weeksUntil } from "@/lib/utils";

interface GeneratePlanButtonProps {
  race: Race;
}

export function GeneratePlanButton({ race }: GeneratePlanButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ weeks: number; sessionsCreated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const weeksAvailable = weeksUntil(race.race_date);
      if (weeksAvailable < 1) {
        setError("Race is too soon to generate a plan.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/training/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceName: race.name,
          raceType: race.race_type,
          distanceKm: race.distance_km ?? 10,
          goalTimeSeconds: race.goal_time_seconds ?? 3600,
          weeksAvailable,
          fitnessLevel: race.current_fitness ?? "intermediate",
          recentSessions: [],
        }),
      });
      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl p-4 border"
        style={{
          background: "var(--color-green-dim)",
          borderColor: "var(--color-green)",
        }}
      >
        <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: "var(--color-green)" }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--color-green)" }}>
            Training plan generated!
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {result.sessionsCreated} sessions created across {result.weeks} weeks. Check your Training calendar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        background: "var(--color-surface-1)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Generate AI training plan</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Get a personalized {weeksUntil(race.race_date)}-week plan tailored to your goal
          </p>
          {error && (
            <p className="text-xs mt-1" style={{ color: "var(--color-red)" }}>
              {error}
            </p>
          )}
        </div>
        <Button onClick={handleGenerate} loading={loading} size="sm">
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
      </div>
    </div>
  );
}
