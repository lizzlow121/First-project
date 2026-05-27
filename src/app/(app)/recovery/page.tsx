"use client";

import { useRecovery } from "@/hooks/useRecovery";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { useBloodwork } from "@/hooks/useBloodwork";
import { RecoveryLogForm } from "@/components/recovery/RecoveryLogForm";
import { SupplementTracker } from "@/components/recovery/SupplementTracker";
import { BodyMeasurementsForm } from "@/components/recovery/BodyMeasurementsForm";
import { BloodworkUpload } from "@/components/recovery/BloodworkUpload";
import { BloodworkAnalysisCard } from "@/components/recovery/BloodworkAnalysis";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { format, subDays } from "date-fns";
import { useState } from "react";
import type { BloodworkAnalysis } from "@/types";

function TrendBar({ value, max = 10 }: { value: number | null; max?: number }) {
  if (value === null) {
    return (
      <div
        className="h-8 rounded-lg flex items-center justify-center text-xs"
        style={{
          background: "var(--color-surface-3)",
          color: "var(--color-text-muted)",
        }}
      >
        —
      </div>
    );
  }
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color =
    value >= 7
      ? "var(--color-green)"
      : value >= 4
        ? "var(--color-amber)"
        : "var(--color-red)";

  return (
    <div
      className="h-8 rounded-lg relative overflow-hidden"
      style={{ background: "var(--color-surface-3)" }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-lg transition-all"
        style={{ width: `${pct}%`, background: color, opacity: 0.4 }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

export default function RecoveryPage() {
  const { logs } = useRecovery(7);
  const { logs: weightLogs, addLog: addWeightLog, trend: weightTrend } = useWeightLogs(30);
  const { analyses, deleteAnalysis } = useBloodwork();
  const [newAnalyses, setNewAnalyses] = useState<BloodworkAnalysis[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  const handleAnalysisComplete = (result: BloodworkAnalysis) => {
    setNewAnalyses((prev) => [result, ...prev]);
  };

  // Merge newly added analyses with fetched ones (deduplicate by id)
  const allAnalyses = [
    ...newAnalyses,
    ...analyses.filter((a) => !newAnalyses.some((n) => n.id === a.id)),
  ];

  const todayWeight = weightLogs[0]?.log_date === format(new Date(), "yyyy-MM-dd")
    ? weightLogs[0]
    : null;

  const last7Weights = weightLogs.slice(0, 7);
  const avgWeight =
    last7Weights.length > 0
      ? last7Weights.reduce((s, l) => s + l.weight_kg, 0) / last7Weights.length
      : null;

  const handleLogWeight = async () => {
    const kg = parseFloat(weightInput);
    if (isNaN(kg) || kg <= 0) return;
    setSavingWeight(true);
    await addWeightLog(kg);
    setSavingWeight(false);
    setWeightInput("");
  };

  const trendIcon =
    weightTrend === "up"
      ? "↑"
      : weightTrend === "down"
        ? "↓"
        : weightTrend === "stable"
          ? "→"
          : null;
  const trendColor =
    weightTrend === "up"
      ? "var(--color-amber)"
      : weightTrend === "down"
        ? "var(--color-green)"
        : "var(--color-text-muted)";

  // Last 7 days for trend display
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const log = logs.find((l) => l.log_date === date);
    return { date, log };
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Recovery</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Track sleep, soreness, and supplements
        </p>
      </div>

      {/* 7-day trend */}
      <Card>
        <CardHeader>
          <CardTitle>7-day energy trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-7 gap-1.5">
            {last7.map(({ date, log }) => (
              <div key={date} className="space-y-1">
                <TrendBar value={log?.energy ?? null} />
                <p
                  className="text-center text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {format(new Date(date + "T00:00:00"), "EEE")[0]}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Energy (1–10)
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-green)" }} />
                <span style={{ color: "var(--color-text-muted)" }}>Good (7+)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-amber)" }} />
                <span style={{ color: "var(--color-text-muted)" }}>OK (4–6)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-red)" }} />
                <span style={{ color: "var(--color-text-muted)" }}>Low (&lt;4)</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily check-in */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s check-in</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <RecoveryLogForm />
        </CardContent>
      </Card>

      {/* Weight tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Weight</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {/* Today's log */}
          {todayWeight ? (
            <p className="text-sm text-[var(--color-text-primary)]">
              Today:{" "}
              <span className="font-semibold">{todayWeight.weight_kg} kg</span>
            </p>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="kg"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <button
                onClick={handleLogWeight}
                disabled={savingWeight || !weightInput}
                className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {savingWeight ? "Saving…" : "Log weight"}
              </button>
            </div>
          )}

          {/* Trend indicator */}
          {avgWeight !== null && (
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                7-day avg:{" "}
                <span style={{ color: "var(--color-text-primary)" }}>
                  {avgWeight.toFixed(1)} kg
                </span>
              </span>
              {trendIcon && (
                <span
                  className="text-base font-bold"
                  style={{ color: trendColor }}
                  title={`Trend: ${weightTrend}`}
                >
                  {trendIcon}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Body Measurements */}
      <BodyMeasurementsForm />

      {/* Supplements */}
      <Card>
        <CardHeader>
          <CardTitle>Supplements</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <SupplementTracker />
        </CardContent>
      </Card>

      {/* Bloodwork Analysis */}
      <BloodworkUpload onAnalysisComplete={handleAnalysisComplete} />

      {/* Past analyses */}
      {allAnalyses.length > 0 && (
        <div className="space-y-4">
          {allAnalyses.map((analysis) => (
            <div key={analysis.id} className="relative">
              <BloodworkAnalysisCard analysis={analysis} />
              <div className="absolute top-4 right-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    deleteAnalysis(analysis.id);
                    setNewAnalyses((prev) => prev.filter((a) => a.id !== analysis.id));
                  }}
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
