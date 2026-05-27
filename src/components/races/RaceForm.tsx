"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Race, RaceType, RaceSubtype, FitnessLevel } from "@/types";
import { parseGoalTime, formatGoalTime } from "@/lib/utils";
import { getKnownDistance } from "@/lib/pace-calculator";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  race_type: z.enum(["hyrox", "marathon", "half_marathon", "10k", "5k", "triathlon", "ocr", "other"]),
  race_subtype: z.enum(["hyrox_open", "hyrox_pro", "hyrox_doubles", "marathon", "half_marathon", "10k", "5k", "other"]).nullable().optional(),
  race_date: z.string().min(1, "Date is required"),
  location: z.string().optional(),
  distance_km: z.coerce.number().positive().optional().nullable(),
  goal_time: z.string().optional(),
  current_fitness: z.enum(["beginner", "intermediate", "advanced"]).nullable().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RaceFormProps {
  defaultValues?: Partial<Race>;
  onSubmit: (data: Omit<Race, "id" | "user_id" | "created_at">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const RACE_TYPES: { value: RaceType; label: string }[] = [
  { value: "hyrox", label: "Hyrox" },
  { value: "marathon", label: "Marathon" },
  { value: "half_marathon", label: "Half Marathon" },
  { value: "10k", label: "10K" },
  { value: "5k", label: "5K" },
  { value: "triathlon", label: "Triathlon" },
  { value: "ocr", label: "OCR / Obstacle" },
  { value: "other", label: "Other" },
];

const HYROX_SUBTYPES: { value: RaceSubtype; label: string }[] = [
  { value: "hyrox_open", label: "Open" },
  { value: "hyrox_pro", label: "Pro" },
  { value: "hyrox_doubles", label: "Doubles" },
];

const FITNESS_LEVELS: { value: FitnessLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const KNOWN_TYPE_DISTANCES: Partial<Record<RaceType, number>> = {
  marathon: 42.195,
  half_marathon: 21.0975,
  "10k": 10,
  "5k": 5,
};

export function RaceForm({ defaultValues, onSubmit, onCancel, loading }: RaceFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: defaultValues?.name ?? "",
      race_type: defaultValues?.race_type ?? "other",
      race_subtype: defaultValues?.race_subtype ?? null,
      race_date: defaultValues?.race_date ?? "",
      location: defaultValues?.location ?? "",
      distance_km: defaultValues?.distance_km ?? null,
      goal_time: defaultValues?.goal_time_seconds ? formatGoalTime(defaultValues.goal_time_seconds) : "",
      current_fitness: defaultValues?.current_fitness ?? null,
      notes: defaultValues?.notes ?? "",
    },
  });

  const raceType = watch("race_type");
  const raceSubtype = watch("race_subtype");

  // Auto-fill distance when type changes
  useEffect(() => {
    if (raceType === "hyrox") {
      // Will be handled by subtype
    } else if (KNOWN_TYPE_DISTANCES[raceType]) {
      setValue("distance_km", KNOWN_TYPE_DISTANCES[raceType] ?? null);
    }
  }, [raceType, setValue]);

  useEffect(() => {
    if (raceType === "hyrox" && raceSubtype) {
      const dist = getKnownDistance(raceSubtype as RaceSubtype);
      if (dist) setValue("distance_km", dist);
    }
  }, [raceSubtype, raceType, setValue]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (values: any) => {
    const v = values as FormValues;
    await onSubmit({
      name: v.name,
      race_type: v.race_type as RaceType,
      race_subtype: (values.race_subtype as RaceSubtype) ?? null,
      race_date: values.race_date,
      location: values.location ?? null,
      distance_km: values.distance_km ?? null,
      goal_time_seconds: values.goal_time ? parseGoalTime(values.goal_time) : null,
      current_fitness: (values.current_fitness as FitnessLevel) ?? null,
      notes: values.notes ?? null,
      actual_finish_time_seconds: null,
      result_rating: null,
      result_notes: null,
      result_logged_at: null,
    });
  };

  const selectClass =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent)]";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Race name"
        id="name"
        placeholder="e.g. Berlin Marathon 2025"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">Race type</label>
          <select className={selectClass} {...register("race_type")}>
            {RACE_TYPES.map((t) => (
              <option key={t.value} value={t.value} style={{ background: "var(--color-surface-2)" }}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {raceType === "hyrox" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Hyrox category</label>
            <select className={selectClass} {...register("race_subtype")}>
              <option value="">Select category</option>
              {HYROX_SUBTYPES.map((t) => (
                <option key={t.value} value={t.value} style={{ background: "var(--color-surface-2)" }}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Race date"
          id="race_date"
          type="date"
          error={errors.race_date?.message}
          {...register("race_date")}
        />
        <Input
          label="Distance (km)"
          id="distance_km"
          type="number"
          step="0.001"
          placeholder="42.195"
          {...register("distance_km")}
        />
      </div>

      <Input label="Location" id="location" placeholder="Berlin, Germany" {...register("location")} />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Goal time"
          id="goal_time"
          placeholder="3:30:00 or 55:00"
          hint="Format: h:mm:ss or mm:ss"
          {...register("goal_time")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">Fitness level</label>
          <select className={selectClass} {...register("current_fitness")}>
            <option value="">Select level</option>
            {FITNESS_LEVELS.map((l) => (
              <option key={l.value} value={l.value} style={{ background: "var(--color-surface-2)" }}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Textarea label="Notes" id="notes" placeholder="Any extra details..." {...register("notes")} />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {defaultValues?.name ? "Save changes" : "Add race"}
        </Button>
      </div>
    </form>
  );
}
