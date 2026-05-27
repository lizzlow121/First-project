"use client";

import { useState } from "react";
import { useSupplements } from "@/hooks/useSupplements";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SupplementForm } from "./SupplementForm";
import { Plus, Check } from "lucide-react";
import type { Supplement } from "@/types";

export function SupplementTracker() {
  const {
    supplements,
    isTaken,
    toggleSupplement,
    addSupplement,
    takenCount,
    totalCount,
    loading,
  } = useSupplements();
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const handleAdd = async (data: Omit<Supplement, "id" | "user_id" | "created_at" | "active">) => {
    setAddLoading(true);
    await addSupplement(data);
    setAddLoading(false);
    setShowAdd(false);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-lg animate-pulse"
            style={{ background: "var(--color-surface-2)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <span
              className="font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {takenCount}
            </span>
            /{totalCount} taken today
          </p>
          {takenCount === totalCount && totalCount > 0 && (
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                background: "var(--color-green-dim)",
                color: "var(--color-green)",
              }}
            >
              All done!
            </span>
          )}
        </div>
      )}

      {/* List */}
      {supplements.length === 0 ? (
        <p
          className="text-sm text-center py-6"
          style={{ color: "var(--color-text-muted)" }}
        >
          No supplements added yet
        </p>
      ) : (
        <div className="space-y-2">
          {supplements.map((supp) => {
            const taken = isTaken(supp.id);
            return (
              <button
                key={supp.id}
                onClick={() => toggleSupplement(supp.id)}
                className="w-full flex items-center gap-3 rounded-xl p-3.5 border text-left transition-all"
                style={{
                  background: taken
                    ? "var(--color-green-dim)"
                    : "var(--color-surface-2)",
                  borderColor: taken
                    ? "var(--color-green)"
                    : "var(--color-border)",
                }}
              >
                {/* Checkbox */}
                <div
                  className="h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                  style={{
                    background: taken ? "var(--color-green)" : "transparent",
                    borderColor: taken
                      ? "var(--color-green)"
                      : "var(--color-border-light)",
                  }}
                >
                  {taken && <Check className="h-3 w-3 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: taken
                        ? "var(--color-green)"
                        : "var(--color-text-primary)",
                    }}
                  >
                    {supp.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {supp.dose && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {supp.dose}
                      </span>
                    )}
                    {supp.timing && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        · {supp.timing}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdd(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4" />
        Add supplement
      </Button>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add supplement">
        <SupplementForm
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          loading={addLoading}
        />
      </Modal>
    </div>
  );
}
