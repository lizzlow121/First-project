"use client";

import { useState } from "react";
import { useRaces } from "@/hooks/useRaces";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RaceForm } from "@/components/races/RaceForm";
import { formatGoalTime } from "@/lib/utils";
import type { Race } from "@/types";
import { Trophy, MapPin, Calendar, Target, Trash2, Plus, Clock } from "lucide-react";
import Link from "next/link";

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
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

export default function RacesPage() {
  const { races, loading, addRace, deleteRace } = useRaces();
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (data: Omit<Race, "id" | "user_id" | "created_at">) => {
    setAddLoading(true);
    const { error } = await addRace(data);
    setAddLoading(false);
    if (error) {
      alert(`Failed to save race: ${error.message}`);
      return;
    }
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteRace(id);
    setDeletingId(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Races</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Plan and track your upcoming events
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4" />
          Add race
        </Button>
      </div>

      {/* Race list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--color-surface-1)" }} />
          ))}
        </div>
      ) : races.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Trophy className="h-10 w-10 mb-4" style={{ color: "var(--color-text-muted)" }} />
          <p className="font-medium">No races yet</p>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Add your first race to start planning
          </p>
          <Button onClick={() => setShowAdd(true)} size="sm">
            <Plus className="h-4 w-4" />
            Add race
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {races.map((race) => {
            const days = daysUntil(race.race_date);
            const isPast = days < 0;

            return (
              <Card key={race.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--color-surface-3)" }}
                  >
                    <Trophy className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/races/${race.id}`}
                        className="font-semibold hover:underline"
                      >
                        {race.name}
                      </Link>
                      <Badge variant={raceTypeBadgeVariant(race.race_type)}>
                        {raceTypeLabel(race.race_type)}
                        {race.race_subtype === "hyrox_pro" && " Pro"}
                        {race.race_subtype === "hyrox_doubles" && " Doubles"}
                      </Badge>
                      {isPast && (
                        <Badge variant="default">Completed</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(race.race_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      {race.location && (
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          <MapPin className="h-3.5 w-3.5" />
                          {race.location}
                        </span>
                      )}

                      {race.goal_time_seconds && (
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          <Target className="h-3.5 w-3.5" />
                          Goal: {formatGoalTime(race.goal_time_seconds)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {!isPast && (
                      <div className="text-right">
                        <p
                          className="text-lg font-bold tabular-nums"
                          style={{ color: days <= 14 ? "var(--color-amber)" : "var(--color-accent)" }}
                        >
                          {days}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          days
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleDelete(race.id)}
                      disabled={deletingId === race.id}
                      className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface-3)]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Countdown bar if within 90 days */}
                {!isPast && days <= 90 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                        <Clock className="h-3 w-3" />
                        Countdown
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {days} days to go
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-3)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(0, ((90 - days) / 90) * 100)}%`,
                          background: days <= 14 ? "var(--color-amber)" : "var(--color-accent)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Race Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add race">
        <RaceForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} loading={addLoading} />
      </Modal>
    </div>
  );
}
