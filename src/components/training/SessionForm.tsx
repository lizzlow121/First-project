"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { effortColor } from "@/lib/utils";
import { todayISO } from "@/lib/utils";
import type { TrainingSession, SessionType, Race } from "@/types";
import { cn } from "@/lib/utils";

type FormValues = {
  title: string;
  session_type: SessionType;
  session_date: string;
  duration_minutes: string;
  distance_km: string;
  perceived_effort: string;
  notes: string;
  race_id: string;
};

interface SessionFormProps {
  defaultValues?: Partial<TrainingSession & { goal_time?: string }>;
  races?: Race[];
  onSubmit: (data: Omit<TrainingSession, "id" | "user_id" | "created_at">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: "run", label: "Run" },
  { value: "ride", label: "Ride" },
  { value: "swim", label: "Swim" },
  { value: "strength", label: "Strength" },
  { value: "hyrox", label: "Hyrox" },
  { value: "ocr", label: "OCR" },
  { value: "yoga", label: "Yoga" },
  { value: "rest", label: "Rest" },
  { value: "other", label: "Other" },
];

export function SessionForm({
  defaultValues,
  races = [],
  onSubmit,
  onCancel,
  loading,
}: SessionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: defaultValues?.title ?? "",
      session_type: defaultValues?.session_type ?? "run",
      session_date: defaultValues?.session_date ?? todayISO(),
      duration_minutes: defaultValues?.duration_minutes?.toString() ?? "",
      distance_km: defaultValues?.distance_km?.toString() ?? "",
      perceived_effort: defaultValues?.perceived_effort?.toString() ?? "",
      notes: defaultValues?.notes ?? "",
      race_id: defaultValues?.race_id ?? "",
    },
  });

  const effort = parseInt(watch("perceived_effort") ?? "0");

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({
      title: values.title,
      session_type: values.session_type,
      session_date: values.session_date,
      duration_minutes: values.duration_minutes ? parseInt(values.duration_minutes) : null,
      distance_km: values.distance_km ? parseFloat(values.distance_km) : null,
      perceived_effort: values.perceived_effort ? parseInt(values.perceived_effort) : null,
      pace_per_km_seconds: null,
      notes: values.notes || null,
      source: "manual",
      external_id: null,
      race_id: values.race_id || null,
    });
  };

  const selectClass =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent)]";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Session title"
        id="title"
        placeholder="e.g. Easy long run"
        error={errors.title?.message}
        {...register("title", { required: "Title is required" })}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Type
          </label>
          <select className={selectClass} {...register("session_type")}>
            {SESSION_TYPES.map((t) => (
              <option key={t.value} value={t.value} style={{ background: "var(--color-surface-2)" }}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date"
          id="session_date"
          type="date"
          {...register("session_date")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Duration (minutes)"
          id="duration_minutes"
          type="number"
          placeholder="60"
          {...register("duration_minutes")}
        />
        <Input
          label="Distance (km)"
          id="distance_km"
          type="number"
          step="0.01"
          placeholder="10.0"
          {...register("distance_km")}
        />
      </div>

      {/* Effort slider */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Perceived effort{" "}
          {effort > 0 && (
            <span className={cn("font-bold", effortColor(effort))}>
              {effort}/10
            </span>
          )}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          className="w-full accent-[var(--color-accent)] cursor-pointer"
          {...register("perceived_effort")}
        />
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <span
              key={n}
              className={cn(
                "text-xs tabular-nums",
                n === effort ? effortColor(n) : ""
              )}
              style={{
                color:
                  n === effort
                    ? undefined
                    : "var(--color-text-muted)",
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {races.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Link to race (optional)
          </label>
          <select className={selectClass} {...register("race_id")}>
            <option value="">No race</option>
            {races.map((r) => (
              <option key={r.id} value={r.id} style={{ background: "var(--color-surface-2)" }}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Textarea
        label="Notes"
        id="notes"
        placeholder="How did it go?"
        {...register("notes")}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Save session
        </Button>
      </div>
    </form>
  );
}
