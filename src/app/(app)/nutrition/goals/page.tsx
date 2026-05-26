"use client";

import { useNutrition } from "@/hooks/useNutrition";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

type FormValues = {
  calories_target: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
};

export default function NutritionGoalsPage() {
  const { goals, saveGoals, loading } = useNutrition();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      calories_target: "",
      protein_g: "",
      carbs_g: "",
      fat_g: "",
    },
  });

  useEffect(() => {
    if (goals) {
      reset({
        calories_target: goals.calories_target.toString(),
        protein_g: goals.protein_g.toString(),
        carbs_g: goals.carbs_g.toString(),
        fat_g: goals.fat_g.toString(),
      });
    }
  }, [goals, reset]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    await saveGoals({
      calories_target: parseInt(values.calories_target),
      protein_g: parseInt(values.protein_g),
      carbs_g: parseInt(values.carbs_g),
      fat_g: parseInt(values.fat_g),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/nutrition"
          className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Nutrition goals</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Set your daily macro targets
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg animate-pulse"
              style={{ background: "var(--color-surface-1)" }}
            />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Daily calories (kcal)"
            id="calories_target"
            type="number"
            placeholder="2000"
            hint="Total daily calorie target"
            error={errors.calories_target?.message}
            {...register("calories_target", { required: "Required" })}
          />
          <Input
            label="Protein (g)"
            id="protein_g"
            type="number"
            placeholder="150"
            hint="~1.8–2.2g per kg bodyweight for athletes"
            error={errors.protein_g?.message}
            {...register("protein_g", { required: "Required" })}
          />
          <Input
            label="Carbohydrates (g)"
            id="carbs_g"
            type="number"
            placeholder="250"
            hint="Main energy source for training"
            error={errors.carbs_g?.message}
            {...register("carbs_g", { required: "Required" })}
          />
          <Input
            label="Fat (g)"
            id="fat_g"
            type="number"
            placeholder="70"
            hint="~0.8–1g per kg bodyweight"
            error={errors.fat_g?.message}
            {...register("fat_g", { required: "Required" })}
          />

          <div
            className="rounded-xl p-4 border"
            style={{
              background: "var(--color-surface-1)",
              borderColor: "var(--color-border)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              <strong style={{ color: "var(--color-text-secondary)" }}>Note:</strong>{" "}
              These are daily targets. Adjust based on your training intensity and body composition goals. A sports dietitian can provide personalised guidance.
            </p>
          </div>

          <Button type="submit" loading={saving} className="w-full">
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save goals"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
