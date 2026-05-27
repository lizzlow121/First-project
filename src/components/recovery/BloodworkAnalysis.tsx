"use client";

import { useState } from "react";
import { CheckCircle, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { BloodworkAnalysis, BloodworkMarker, BloodworkSuggestion } from "@/types";
import { format } from "date-fns";

interface BloodworkAnalysisProps {
  analysis: BloodworkAnalysis;
}

const STATUS_COLORS: Record<BloodworkMarker["status"], { bg: string; text: string; label: string }> = {
  optimal: {
    bg: "color-mix(in srgb, var(--color-green) 12%, transparent)",
    text: "var(--color-green)",
    label: "Optimal",
  },
  low: {
    bg: "color-mix(in srgb, var(--color-amber) 12%, transparent)",
    text: "var(--color-amber)",
    label: "Low",
  },
  high: {
    bg: "color-mix(in srgb, var(--color-red) 12%, transparent)",
    text: "var(--color-red)",
    label: "High",
  },
  deficient: {
    bg: "color-mix(in srgb, var(--color-amber) 12%, transparent)",
    text: "var(--color-amber)",
    label: "Deficient",
  },
  elevated: {
    bg: "color-mix(in srgb, var(--color-red) 12%, transparent)",
    text: "var(--color-red)",
    label: "Elevated",
  },
};

const ACTION_COLORS: Record<BloodworkSuggestion["action"], { bg: string; text: string; label: string }> = {
  add: {
    bg: "color-mix(in srgb, #3b82f6 12%, transparent)",
    text: "#3b82f6",
    label: "ADD",
  },
  increase: {
    bg: "color-mix(in srgb, var(--color-amber) 12%, transparent)",
    text: "var(--color-amber)",
    label: "INCREASE",
  },
  decrease: {
    bg: "color-mix(in srgb, #f97316 12%, transparent)",
    text: "#f97316",
    label: "DECREASE",
  },
  remove: {
    bg: "color-mix(in srgb, var(--color-red) 12%, transparent)",
    text: "var(--color-red)",
    label: "REMOVE",
  },
  maintain: {
    bg: "color-mix(in srgb, var(--color-green) 12%, transparent)",
    text: "var(--color-green)",
    label: "MAINTAIN",
  },
};

function StatusBadge({ status }: { status: BloodworkMarker["status"] }) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: colors.bg, color: colors.text }}
    >
      {colors.label}
    </span>
  );
}

function ActionBadge({ action }: { action: BloodworkSuggestion["action"] }) {
  const colors = ACTION_COLORS[action];
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tracking-wide"
      style={{ background: colors.bg, color: colors.text }}
    >
      {colors.label}
    </span>
  );
}

function MarkerCard({ marker }: { marker: BloodworkMarker }) {
  const isHighPriority = marker.priority === "high";
  const isNormal = marker.status === "optimal";

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: "var(--color-surface-2)",
        borderColor: isHighPriority && !isNormal
          ? "color-mix(in srgb, var(--color-red) 40%, transparent)"
          : "var(--color-border)",
        boxShadow: isHighPriority && !isNormal
          ? "0 0 0 1px color-mix(in srgb, var(--color-red) 20%, transparent)"
          : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
          {marker.name}
        </p>
        <StatusBadge status={marker.status} />
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
        {marker.value}
        <span className="font-normal text-xs ml-2" style={{ color: "var(--color-text-muted)" }}>
          Ref: {marker.reference_range}
        </span>
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {marker.athletic_impact}
      </p>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: BloodworkSuggestion }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const canAdd = suggestion.action === "add" || suggestion.action === "increase";

  const handleAddSupplement = async () => {
    setAdding(true);
    try {
      const supabase = createClient();
      await supabase.from("supplements").insert({
        name: suggestion.supplement,
        dose: suggestion.dose ?? null,
        timing: suggestion.timing ?? null,
        active: true,
      });
      setAdded(true);
    } catch {
      // silently fail
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: "var(--color-surface-2)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ActionBadge action={suggestion.action} />
          <p className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
            {suggestion.supplement}
          </p>
        </div>
      </div>
      <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>
        <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
          {suggestion.dose}
        </span>
        {suggestion.timing && (
          <span> &mdash; {suggestion.timing}</span>
        )}
      </p>
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-secondary)" }}>
        {suggestion.reason}
      </p>
      {suggestion.markers_addressed.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestion.markers_addressed.map((marker) => (
            <span
              key={marker}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
              style={{
                background: "var(--color-surface-3)",
                color: "var(--color-text-muted)",
              }}
            >
              {marker}
            </span>
          ))}
        </div>
      )}
      {canAdd && !added && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={adding}
          onClick={handleAddSupplement}
          className="flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add to my supplements
        </Button>
      )}
      {added && (
        <p className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--color-green)" }}>
          <CheckCircle className="h-3.5 w-3.5" />
          Added to supplements
        </p>
      )}
    </div>
  );
}

export function BloodworkAnalysisCard({ analysis }: BloodworkAnalysisProps) {
  const result = analysis.analysis;

  const analyzedDate = (() => {
    try {
      return format(new Date(analysis.analyzed_at), "d MMM yyyy");
    } catch {
      return analysis.analyzed_at;
    }
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
              {analysis.filename}
            </p>
            <p className="text-xs shrink-0 ml-2" style={{ color: "var(--color-text-muted)" }}>
              {analyzedDate}
            </p>
          </div>
          {result.summary && (
            <div
              className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                color: "var(--color-text-secondary)",
                borderLeft: "3px solid var(--color-accent)",
              }}
            >
              {result.summary}
            </div>
          )}
        </div>

        {/* Markers */}
        {result.markers && result.markers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
              Your Results
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.markers.map((marker) => (
                <MarkerCard key={marker.name} marker={marker} />
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {result.suggestions && result.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
              Supplement Recommendations
            </h4>
            <div className="space-y-3">
              {result.suggestions.map((suggestion, i) => (
                <SuggestionCard key={`${suggestion.supplement}-${i}`} suggestion={suggestion} />
              ))}
            </div>
          </div>
        )}

        {/* Already optimal */}
        {result.already_optimal && result.already_optimal.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
              Looking Good
            </h4>
            <div className="space-y-2">
              {result.already_optimal.map((item) => (
                <div key={item.supplement} className="flex items-start gap-2">
                  <CheckCircle
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: "var(--color-green)" }}
                  />
                  <div>
                    <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {item.supplement}
                    </span>
                    <span className="text-sm ml-2" style={{ color: "var(--color-text-muted)" }}>
                      &mdash; {item.assessment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
