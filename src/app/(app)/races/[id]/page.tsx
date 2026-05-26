import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatGoalTime, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PaceReferenceCard } from "@/components/races/PaceReferenceCard";
import { GeneratePlanButton } from "@/components/races/GeneratePlanButton";
import { MapPin, Calendar, Target, Trophy, Activity } from "lucide-react";
import { format } from "date-fns";
import type { Race, TrainingSession } from "@/types";

function raceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    hyrox: "Hyrox",
    marathon: "Marathon",
    half_marathon: "Half Marathon",
    "10k": "10K",
    "5k": "5K",
    triathlon: "Triathlon",
    ocr: "OCR",
    other: "Race",
  };
  return map[type] ?? type;
}

function raceTypeBadgeVariant(type: string): "blue" | "orange" | "green" | "amber" | "default" {
  const map: Record<string, "blue" | "orange" | "green" | "amber" | "default"> = {
    hyrox: "orange",
    marathon: "blue",
    half_marathon: "blue",
    "10k": "green",
    "5k": "green",
    triathlon: "amber",
    ocr: "orange",
  };
  return map[type] ?? "default";
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function sessionTypeColor(type: string): string {
  const map: Record<string, string> = {
    run: "#3b82f6",
    ride: "#06b6d4",
    swim: "#38bdf8",
    strength: "#f97316",
    hyrox: "#facc15",
    ocr: "#22c55e",
    yoga: "#a78bfa",
    rest: "#71717a",
    other: "#6b7280",
  };
  return map[type] ?? "#6b7280";
}

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [raceRes, sessionsRes] = await Promise.all([
    supabase.from("races").select("*").eq("id", id).single(),
    supabase
      .from("training_sessions")
      .select("*")
      .eq("race_id", id)
      .order("session_date", { ascending: false })
      .limit(10),
  ]);

  if (raceRes.error || !raceRes.data) {
    notFound();
  }

  const race = raceRes.data as Race;
  const sessions = (sessionsRes.data ?? []) as TrainingSession[];
  const days = daysUntil(race.race_date);
  const isPast = days < 0;

  // Compute pace vs goal
  const recentRunSessions = sessions.filter(
    (s) => s.session_type === "run" && s.distance_km && s.duration_minutes
  );
  let trackingStatus: "on_track" | "ahead" | "behind" | null = null;
  if (
    race.goal_time_seconds &&
    race.distance_km &&
    recentRunSessions.length > 0
  ) {
    const goalPace = race.goal_time_seconds / race.distance_km;
    const recentPaces = recentRunSessions
      .slice(0, 3)
      .map((s) => ((s.duration_minutes! * 60) / s.distance_km!));
    const avgRecentPace = recentPaces.reduce((a, b) => a + b, 0) / recentPaces.length;
    const ratio = avgRecentPace / goalPace;
    if (ratio < 1.05) trackingStatus = "ahead";
    else if (ratio < 1.15) trackingStatus = "on_track";
    else trackingStatus = "behind";
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: "var(--color-surface-1)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 h-14 w-14 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-surface-3)" }}
          >
            <Trophy
              className="h-7 w-7"
              style={{ color: "var(--color-accent)" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold">{race.name}</h1>
              <Badge variant={raceTypeBadgeVariant(race.race_type)}>
                {raceTypeLabel(race.race_type)}
              </Badge>
              {isPast && <Badge variant="default">Completed</Badge>}
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              <span
                className="flex items-center gap-1.5 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Calendar className="h-4 w-4" />
                {new Date(race.race_date).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {race.location && (
                <span
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <MapPin className="h-4 w-4" />
                  {race.location}
                </span>
              )}
              {race.goal_time_seconds && (
                <span
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <Target className="h-4 w-4" />
                  Goal: {formatGoalTime(race.goal_time_seconds)}
                </span>
              )}
            </div>

            {!isPast && (
              <div className="mt-3">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={{
                    color:
                      days <= 14
                        ? "var(--color-amber)"
                        : "var(--color-accent)",
                  }}
                >
                  {days}
                </span>
                <span
                  className="text-sm ml-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  days to go
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tracking status */}
      {trackingStatus && (
        <div
          className="flex items-center gap-3 rounded-xl p-4 border"
          style={{
            background:
              trackingStatus === "ahead"
                ? "var(--color-green-dim)"
                : trackingStatus === "on_track"
                  ? "var(--color-accent-dim)"
                  : "var(--color-amber-dim)",
            borderColor:
              trackingStatus === "ahead"
                ? "var(--color-green)"
                : trackingStatus === "on_track"
                  ? "var(--color-accent)"
                  : "var(--color-amber)",
          }}
        >
          <Activity
            className="h-5 w-5"
            style={{
              color:
                trackingStatus === "ahead"
                  ? "var(--color-green)"
                  : trackingStatus === "on_track"
                    ? "var(--color-accent)"
                    : "var(--color-amber)",
            }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{
                color:
                  trackingStatus === "ahead"
                    ? "var(--color-green)"
                    : trackingStatus === "on_track"
                      ? "var(--color-accent)"
                      : "var(--color-amber)",
              }}
            >
              {trackingStatus === "ahead"
                ? "Ahead of target"
                : trackingStatus === "on_track"
                  ? "On track"
                  : "Behind target"}
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Based on your recent training pace vs goal pace
            </p>
          </div>
        </div>
      )}

      {/* Pace reference card */}
      {race.goal_time_seconds && race.distance_km && (
        <PaceReferenceCard
          goalTimeSeconds={race.goal_time_seconds}
          distanceKm={race.distance_km}
          raceType={race.race_type}
        />
      )}

      {/* Generate plan */}
      {!isPast && (
        <GeneratePlanButton race={race} />
      )}

      {/* Recent sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Training sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p
              className="text-sm text-center py-6"
              style={{ color: "var(--color-text-muted)" }}
            >
              No sessions linked to this race yet
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 py-2.5 border-b last:border-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ background: sessionTypeColor(session.session_type) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {format(new Date(session.session_date), "d MMM yyyy")}
                    </p>
                  </div>
                  <div
                    className="text-xs text-right flex-shrink-0"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {session.duration_minutes && (
                      <span>{formatDuration(session.duration_minutes)}</span>
                    )}
                    {session.distance_km && (
                      <span className="ml-2">{session.distance_km}km</span>
                    )}
                    {session.perceived_effort && (
                      <span
                        className="ml-2 font-medium"
                        style={{
                          color:
                            session.perceived_effort <= 3
                              ? "var(--color-green)"
                              : session.perceived_effort <= 6
                                ? "var(--color-amber)"
                                : "var(--color-red)",
                        }}
                      >
                        RPE {session.perceived_effort}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
