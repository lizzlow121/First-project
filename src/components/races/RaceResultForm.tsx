"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { parseGoalTime, formatGoalTime } from "@/lib/utils";
import { Star, Trophy } from "lucide-react";
import type { Race } from "@/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface RaceResultFormProps {
  race: Race;
}

export function RaceResultForm({ race }: RaceResultFormProps) {
  const router = useRouter();
  const hasResult = race.actual_finish_time_seconds !== null;
  const [finishTime, setFinishTime] = useState(
    hasResult ? formatGoalTime(race.actual_finish_time_seconds!) : ""
  );
  const [rating, setRating] = useState(race.result_rating ?? 0);
  const [notes, setNotes] = useState(race.result_notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const seconds = parseGoalTime(finishTime);
    await supabase
      .from("races")
      .update({
        actual_finish_time_seconds: seconds,
        result_rating: rating || null,
        result_notes: notes || null,
        result_logged_at: new Date().toISOString(),
      })
      .eq("id", race.id);
    setSaving(false);
    router.refresh();
  };

  const delta =
    hasResult && race.goal_time_seconds
      ? race.actual_finish_time_seconds! - race.goal_time_seconds
      : null;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[var(--color-orange)]" />
          <h3 className="text-sm font-semibold">Race Result</h3>
        </div>

        {hasResult && delta !== null && (
          <div className="rounded-lg bg-[var(--color-surface-2)] p-3 border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              vs Goal
            </p>
            <p
              className={cn(
                "text-base font-semibold",
                delta < 0
                  ? "text-[var(--color-green)]"
                  : delta > 0
                  ? "text-[var(--color-amber)]"
                  : "text-[var(--color-text-primary)]"
              )}
            >
              {delta < 0 ? "Beat goal by " : delta > 0 ? "Off goal by " : "On goal: "}
              {formatGoalTime(Math.abs(delta))}
            </p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="finish_time"
            label="Finish time"
            placeholder="1:05:30"
            value={finishTime}
            onChange={(e) => setFinishTime(e.target.value)}
            hint="Format: H:MM:SS or MM:SS"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              How did it feel?
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      n <= rating
                        ? "fill-[var(--color-orange)] text-[var(--color-orange)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            id="result_notes"
            label="Race recap"
            placeholder="What went well? What would you do differently?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />

          <Button type="submit" loading={saving} className="w-full">
            {hasResult ? "Update result" : "Log race result"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
