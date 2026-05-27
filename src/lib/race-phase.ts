import type { RaceType } from "@/types";

export type PhaseName =
  | "Base"
  | "Foundation"
  | "Build"
  | "Specific"
  | "Peak"
  | "Sharpen"
  | "Taper"
  | "Race Week"
  | "Race Day"
  | "Recovery";

export interface RacePhase {
  phase: PhaseName;
  tWeeks: string;       // "T-8 WEEKS" or "T-3 DAYS" or "RACE DAY"
  focus: string;        // short headline
  detail: string;       // one sentence elaboration
  accent: "blue" | "orange" | "amber" | "red" | "green" | "gray";
}

export function formatTMinus(daysToRace: number): string {
  if (daysToRace <= 0) return "RACE DAY";
  if (daysToRace < 1) return "T-1 DAY";
  if (daysToRace <= 13) return `T-${Math.ceil(daysToRace)} DAYS`;
  return `T-${Math.ceil(daysToRace / 7)} WEEKS`;
}

function genericRunningPhase(days: number): Omit<RacePhase, "tWeeks"> {
  if (days <= 0) return {
    phase: "Race Day",
    focus: "Trust your training",
    detail: "You've put in the work. Stick to your race plan and finish strong.",
    accent: "green",
  };
  if (days < 1) return {
    phase: "Race Week",
    focus: "Rest, hydrate, visualize",
    detail: "Easy shakeout only. Lay out kit, review your pacing plan, get to bed early.",
    accent: "red",
  };
  if (days <= 7) return {
    phase: "Taper",
    focus: "Less is more this week",
    detail: "Cut volume by 50%, keep one short sharpener. Prioritize sleep and fuel.",
    accent: "red",
  };
  if (days <= 14) return {
    phase: "Sharpen",
    focus: "Drop volume, keep intensity",
    detail: "Reduce mileage 15-20%. Short race-pace efforts to keep legs snappy.",
    accent: "orange",
  };
  if (days <= 28) return {
    phase: "Peak",
    focus: "Race pace simulations",
    detail: "Hit your highest weekly volume. Two quality sessions: race-pace + intervals.",
    accent: "orange",
  };
  if (days <= 49) return {
    phase: "Build",
    focus: "Threshold capacity",
    detail: "Add 2 quality sessions per week: one tempo, one intervals. Long run holds form.",
    accent: "amber",
  };
  if (days <= 70) return {
    phase: "Foundation",
    focus: "Strides + hills",
    detail: "Add 1 quality session weekly. Hill repeats and strides build economy without heavy load.",
    accent: "blue",
  };
  return {
    phase: "Base",
    focus: "Aerobic base + consistency",
    detail: "Build weekly mileage gradually. Mostly easy running, one long run weekly.",
    accent: "blue",
  };
}

function hyroxPhase(days: number): Omit<RacePhase, "tWeeks"> {
  if (days <= 0) return {
    phase: "Race Day",
    focus: "Execute your plan",
    detail: "Steady pace on runs, smooth transitions, breathe through the burn.",
    accent: "green",
  };
  if (days < 1) return {
    phase: "Race Week",
    focus: "Walk through the course",
    detail: "Light shakeout, mental rehearsal of all 8 stations and transitions.",
    accent: "red",
  };
  if (days <= 7) return {
    phase: "Taper",
    focus: "Move easy, eat well",
    detail: "Light shakeouts only. Visualize stations. Carb load from day 3 out.",
    accent: "red",
  };
  if (days <= 14) return {
    phase: "Sharpen",
    focus: "Compromised running",
    detail: "Practice running on heavy legs after station work. Half-Hyrox sim once this week.",
    accent: "orange",
  };
  if (days <= 28) return {
    phase: "Specific",
    focus: "Run + station combos",
    detail: "1km run → 1 station, repeat. Build muscular endurance under fatigue.",
    accent: "orange",
  };
  if (days <= 49) return {
    phase: "Build",
    focus: "Station familiarity",
    detail: "Sandbag lunges, sled push, wall balls. Find form, build capacity progressively.",
    accent: "amber",
  };
  if (days <= 70) return {
    phase: "Foundation",
    focus: "Strength + threshold",
    detail: "Compound lifts 3×/week. Start adding tempo runs and 400m intervals.",
    accent: "blue",
  };
  return {
    phase: "Base",
    focus: "Aerobic engine + GPP",
    detail: "Easy 5-6km runs, full-body strength 3×/week. Build the engine first.",
    accent: "blue",
  };
}

function ocrPhase(days: number): Omit<RacePhase, "tWeeks"> {
  if (days <= 0) return {
    phase: "Race Day",
    focus: "Grip steady, mind sharp",
    detail: "Pace yourself on the trails, conserve grip strength for late obstacles.",
    accent: "green",
  };
  if (days <= 7) return {
    phase: "Taper",
    focus: "Recovery + visualization",
    detail: "Light movement, mental rehearsal of obstacles. Fuel and hydrate well.",
    accent: "red",
  };
  if (days <= 21) return {
    phase: "Peak",
    focus: "Grip endurance + trail running",
    detail: "Hangboard or dead hangs, technical trail runs with elevation.",
    accent: "orange",
  };
  if (days <= 49) return {
    phase: "Build",
    focus: "Obstacle-specific strength",
    detail: "Pull-ups, farmer carries, sandbag work. Build upper-body endurance.",
    accent: "amber",
  };
  return {
    phase: "Base",
    focus: "Trail running + strength",
    detail: "Build aerobic base on trails. Compound strength 2-3×/week.",
    accent: "blue",
  };
}

export function getRacePhase(daysToRace: number, raceType: RaceType): RacePhase {
  let phaseData: Omit<RacePhase, "tWeeks">;

  if (raceType === "hyrox") {
    phaseData = hyroxPhase(daysToRace);
  } else if (raceType === "ocr") {
    phaseData = ocrPhase(daysToRace);
  } else {
    // marathon, half_marathon, 10k, 5k, triathlon, other
    phaseData = genericRunningPhase(daysToRace);
  }

  return {
    ...phaseData,
    tWeeks: formatTMinus(daysToRace),
  };
}
