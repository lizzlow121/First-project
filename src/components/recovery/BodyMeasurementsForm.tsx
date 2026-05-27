"use client";

import { useState } from "react";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { todayISO } from "@/lib/utils";
import { Ruler } from "lucide-react";

export function BodyMeasurementsForm() {
  const { latest, upsertMeasurement, measurements, loading } = useBodyMeasurements();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(latest?.weight_kg?.toString() ?? "");
  const [bodyFat, setBodyFat] = useState(latest?.body_fat_pct?.toString() ?? "");
  const [waist, setWaist] = useState(latest?.waist_cm?.toString() ?? "");
  const [chest, setChest] = useState(latest?.chest_cm?.toString() ?? "");
  const [arm, setArm] = useState(latest?.arm_cm?.toString() ?? "");
  const [thigh, setThigh] = useState(latest?.thigh_cm?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await upsertMeasurement({
      log_date: todayISO(),
      weight_kg: weight ? parseFloat(weight) : null,
      body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
      waist_cm: waist ? parseFloat(waist) : null,
      chest_cm: chest ? parseFloat(chest) : null,
      arm_cm: arm ? parseFloat(arm) : null,
      thigh_cm: thigh ? parseFloat(thigh) : null,
      notes: null,
    });
    setSaving(false);
    setOpen(false);
  };

  const weightTrend =
    measurements.length >= 2
      ? (measurements[0].weight_kg ?? 0) - (measurements[measurements.length - 1].weight_kg ?? 0)
      : 0;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-[var(--color-accent)]" />
            <h3 className="text-sm font-semibold">Body Measurements</h3>
          </div>
          {!open && (
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
              {latest ? "Update" : "Log"}
            </Button>
          )}
        </div>

        {!open && latest && (
          <div className="grid grid-cols-3 gap-3">
            {latest.weight_kg && (
              <Stat label="Weight" value={`${latest.weight_kg}kg`} trend={weightTrend} />
            )}
            {latest.body_fat_pct && (
              <Stat label="Body Fat" value={`${latest.body_fat_pct}%`} />
            )}
            {latest.waist_cm && <Stat label="Waist" value={`${latest.waist_cm}cm`} />}
            {latest.chest_cm && <Stat label="Chest" value={`${latest.chest_cm}cm`} />}
            {latest.arm_cm && <Stat label="Arm" value={`${latest.arm_cm}cm`} />}
            {latest.thigh_cm && <Stat label="Thigh" value={`${latest.thigh_cm}cm`} />}
          </div>
        )}

        {!open && !latest && !loading && (
          <p className="text-sm text-[var(--color-text-muted)]">No measurements logged yet.</p>
        )}

        {open && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input id="weight" label="Weight (kg)" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <Input id="bf" label="Body Fat (%)" type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
              <Input id="waist" label="Waist (cm)" type="number" step="0.5" value={waist} onChange={(e) => setWaist(e.target.value)} />
              <Input id="chest" label="Chest (cm)" type="number" step="0.5" value={chest} onChange={(e) => setChest(e.target.value)} />
              <Input id="arm" label="Arm (cm)" type="number" step="0.5" value={arm} onChange={(e) => setArm(e.target.value)} />
              <Input id="thigh" label="Thigh (cm)" type="number" step="0.5" value={thigh} onChange={(e) => setThigh(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" loading={saving} className="flex-1">Save</Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{label}</span>
      <span className="text-base font-semibold tabular-nums">{value}</span>
      {trend !== undefined && trend !== 0 && (
        <span className={trend > 0 ? "text-xs text-[var(--color-amber)]" : "text-xs text-[var(--color-green)]"}>
          {trend > 0 ? "+" : ""}{trend.toFixed(1)}kg
        </span>
      )}
    </div>
  );
}
