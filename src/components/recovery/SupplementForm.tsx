"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Supplement } from "@/types";

type FormValues = {
  name: string;
  dose: string;
  timing: string;
  notes: string;
};

interface SupplementFormProps {
  onSubmit: (data: Omit<Supplement, "id" | "user_id" | "created_at" | "active">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function SupplementForm({ onSubmit, onCancel, loading }: SupplementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      dose: "",
      timing: "",
      notes: "",
    },
  });

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({
      name: values.name,
      dose: values.dose || null,
      timing: values.timing || null,
      notes: values.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Supplement name"
        id="name"
        placeholder="e.g. Creatine Monohydrate"
        error={errors.name?.message}
        {...register("name", { required: "Name is required" })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Dose"
          id="dose"
          placeholder="e.g. 5g"
          {...register("dose")}
        />
        <Input
          label="Timing"
          id="timing"
          placeholder="e.g. Post-workout"
          {...register("timing")}
        />
      </div>
      <Textarea
        label="Notes"
        id="notes"
        placeholder="Any additional notes..."
        {...register("notes")}
      />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Add supplement
        </Button>
      </div>
    </form>
  );
}
