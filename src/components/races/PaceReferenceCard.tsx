"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatPace, formatDuration } from "@/lib/utils";
import { calcPaceZones, calcHyroxSplits } from "@/lib/pace-calculator";
import type { RaceType } from "@/types";

interface PaceReferenceCardProps {
  goalTimeSeconds: number;
  distanceKm: number;
  raceType: RaceType;
}

interface PaceRow {
  label: string;
  pace: number;
  description: string;
}

export function PaceReferenceCard({
  goalTimeSeconds,
  distanceKm,
  raceType,
}: PaceReferenceCardProps) {
  const zones = calcPaceZones(goalTimeSeconds, distanceKm);

  const paceRows: PaceRow[] = [
    {
      label: "Race pace",
      pace: zones.race_pace_sec_per_km,
      description: "Target race pace",
    },
    {
      label: "Tempo",
      pace: zones.tempo_sec_per_km,
      description: "Comfortably hard",
    },
    {
      label: "Easy",
      pace: zones.easy_sec_per_km,
      description: "Recovery & aerobic base",
    },
    {
      label: "Interval",
      pace: zones.interval_sec_per_km,
      description: "Short hard reps",
    },
  ];

  const isHyrox = raceType === "hyrox";
  const hyroxSplits = isHyrox ? calcHyroxSplits(goalTimeSeconds) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pace reference</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1">
          {paceRows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2.5 border-b last:border-0"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <p className="text-sm font-medium">{row.label}</p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {row.description}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-sm font-semibold tabular-nums"
                  style={{
                    color:
                      i === 0
                        ? "var(--color-accent)"
                        : i === 3
                          ? "var(--color-orange)"
                          : "var(--color-text-primary)",
                  }}
                >
                  {formatPace(row.pace)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {isHyrox && hyroxSplits && (
          <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Hyrox splits
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-lg p-3"
                style={{ background: "var(--color-surface-2)" }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Target run pace
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-accent)" }}
                >
                  {formatPace(hyroxSplits.run_pace_sec_per_km)}
                </p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ background: "var(--color-surface-2)" }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Stations budget
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-orange)" }}
                >
                  {formatDuration(Math.round(hyroxSplits.station_total_seconds / 60))}
                </p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ background: "var(--color-surface-2)" }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Running time
                </p>
                <p className="text-sm font-semibold">
                  {formatDuration(Math.round(hyroxSplits.run_total_seconds / 60))}
                </p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ background: "var(--color-surface-2)" }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  8 x 1km runs
                </p>
                <p className="text-sm font-semibold">
                  {formatPace(hyroxSplits.per_km_split_seconds)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
