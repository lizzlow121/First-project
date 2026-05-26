"use client";

import { useRecovery } from "@/hooks/useRecovery";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { todayISO, cn } from "@/lib/utils";
import { Check } from "lucide-react";

type FormValues = {
  sleep_hours: string;
  soreness: string;
  energy: string;
  hrv_ms: string;
  resting_hr: string;
  notes: string;
};

export function RecoveryLogForm() {
  const { todayLog, upsertLog } = useRecovery();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      sleep_hours: "",
      soreness: "5",
      energy: "5",
      hrv_ms: "",
      resting_hr: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (todayLog) {
      reset({
        sleep_hours: todayLog.sleep_hours?.toString() ?? "",
        soreness: todayLog.soreness?.toString() ?? "5",
        energy: todayLog.energy?.toString() ?? "5",
        hrv_ms: todayLog.hrv_ms?.toString() ?? "",
        resting_hr: todayLog.resting_hr?.toString() ?? "",
        notes: todayLog.notes ?? "",
      });
    }
  }, [todayLog, reset]);

  const soreness = parseInt(watch("soreness") ?? "5");
  const energy = parseInt(watch("energy") ?? "5");

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    await upsertLog({
      log_date: todayISO(),
      sleep_hours: values.sleep_hours ? parseFloat(values.sleep_hours) : null,
      soreness: values.soreness ? parseInt(values.soreness) : null,
      energy: values.energy ? parseInt(values.energy) : null,
      hrv_ms: values.hrv_ms ? parseFloat(values.hrv_ms) : null,
      resting_hr: values.resting_hr ? parseInt(values.resting_hr) : null,
      notes: values.notes || null,
      source: "manual",
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sliderColor = (val: number, inverse = false) => {
    const good = inverse ? val <= 3 : val >= 7;
    const ok = inverse ? val <= 6 : val >= 4;
    if (good) return "var(--color-green)";
    if (ok) return "var(--color-amber)";
    return "var(--color-red)";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Sleep */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Sleep hours
        </label>
        <input
          type="range"
          min="0"
          max="12"
          step="0.5"
          className="w-full cursor-pointer"
          style={{ accentColor: "var(--color-accent)" }}
          {...register("sleep_hours")}
        />
        <div className="flex justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span>0h</span>
          <span
            className="font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {watch("sleep_hours") || "0"}h
          </span>
          <span>12h</span>
        </div>
      </div>

      {/* Soreness */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Muscle soreness{" "}
          <span
            className="font-bold"
            style={{ color: sliderColor(soreness, true) }}
          >
            {soreness}/10
          </span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          className="w-full cursor-pointer"
          style={{ accentColor: sliderColor(soreness, true) }}
          {...register("soreness")}
        />
        <div className="flex justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span>None</span>
          <span>Very sore</span>
        </div>
      </div>

      {/* Energy */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Energy level{" "}
          <span
            className="font-bold"
            style={{ color: sliderColor(energy) }}
          >
            {energy}/10
          </span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          className="w-full cursor-pointer"
          style={{ accentColor: sliderColor(energy) }}
          {...register("energy")}
        />
        <div className="flex justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span>Exhausted</span>
          <span>Great</span>
        </div>
      </div>

      {/* Optional metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="HRV (ms)"
          id="hrv_ms"
          type="number"
          placeholder="Optional"
          hint="From Whoop/Garmin"
          {...register("hrv_ms")}
        />
        <Input
          label="Resting HR (bpm)"
          id="resting_hr"
          type="number"
          placeholder="Optional"
          {...register("resting_hr")}
        />
      </div>

      <Textarea
        label="Notes"
        id="notes"
        placeholder="How are you feeling?"
        {...register("notes")}
      />

      <Button type="submit" loading={saving} className="w-full">
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            Saved!
          </>
        ) : todayLog ? (
          "Update check-in"
        ) : (
          "Save check-in"
        )}
      </Button>
    </form>
  );
}
