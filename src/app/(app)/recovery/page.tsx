"use client";

import { useRecovery } from "@/hooks/useRecovery";
import { RecoveryLogForm } from "@/components/recovery/RecoveryLogForm";
import { SupplementTracker } from "@/components/recovery/SupplementTracker";
import { BodyMeasurementsForm } from "@/components/recovery/BodyMeasurementsForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { format, subDays } from "date-fns";

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
    </div>
  );
}
