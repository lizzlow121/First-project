import type { RAGStatus, DimensionStatus } from "@/types";

export function ragStatus(score: number, greenThreshold: number, amberThreshold: number): RAGStatus {
  if (score >= greenThreshold) return "green";
  if (score >= amberThreshold) return "amber";
  return "red";
}

export function computeReadinessScore(dimensions: DimensionStatus[]): number {
  const weighted = dimensions.filter((d) => d.status !== "none");
  if (weighted.length === 0) return 0;
  const scores = weighted.map((d) => {
    if (d.status === "green") return 100;
    if (d.status === "amber") return 55;
    return 20;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function trainingConsistencyStatus(
  completedSessions: number,
  plannedSessions: number
): DimensionStatus {
  if (plannedSessions === 0) return { status: "none", label: "Training", value: "No plan", trend: [] };
  const pct = (completedSessions / plannedSessions) * 100;
  const status = ragStatus(pct, 80, 50);
  return {
    status,
    label: "Training",
    value: `${completedSessions}/${plannedSessions} sessions`,
    trend: [],
  };
}

export function nutritionStatus(daysOnTrack: number, totalDays: number): DimensionStatus {
  if (totalDays === 0) return { status: "none", label: "Nutrition", value: "No data", trend: [] };
  const status = ragStatus(daysOnTrack, 5, 3);
  return {
    status,
    label: "Nutrition",
    value: `${daysOnTrack}/${totalDays} days on target`,
    trend: [],
  };
}

export function recoveryStatus(avgScore: number | null): DimensionStatus {
  if (avgScore === null) return { status: "none", label: "Recovery", value: "No data", trend: [] };
  const status = ragStatus(avgScore, 7, 5);
  return {
    status,
    label: "Recovery",
    value: `${avgScore.toFixed(1)}/10 avg energy`,
    trend: [],
  };
}

export function supplementStatus(takenDays: number, totalDays: number): DimensionStatus {
  if (totalDays === 0) return { status: "none", label: "Supplements", value: "Not set up", trend: [] };
  const status = ragStatus(takenDays, 6, 4);
  return {
    status,
    label: "Supplements",
    value: `${takenDays}/${totalDays} days complete`,
    trend: [],
  };
}
