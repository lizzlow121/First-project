import type { PaceZones, RaceSubtype } from "@/types";

const HYROX_STATION_SECONDS: Record<string, number> = {
  ski_erg: 210,
  sled_push: 180,
  sled_pull: 180,
  burpee_broad_jumps: 300,
  rowing: 210,
  farmers_carry: 120,
  sandbag_lunges: 360,
  wall_balls: 360,
};

const KNOWN_DISTANCES: Record<RaceSubtype, number | null> = {
  hyrox_open: 8,
  hyrox_pro: 8,
  hyrox_doubles: 8,
  marathon: 42.195,
  half_marathon: 21.0975,
  "10k": 10,
  "5k": 5,
  other: null,
};

export function getKnownDistance(subtype: RaceSubtype): number | null {
  return KNOWN_DISTANCES[subtype] ?? null;
}

export function calcPaceZones(goalTimeSeconds: number, distanceKm: number): PaceZones {
  const race_pace_sec_per_km = goalTimeSeconds / distanceKm;
  return {
    race_pace_sec_per_km: Math.round(race_pace_sec_per_km),
    tempo_sec_per_km: Math.round(race_pace_sec_per_km * 1.08),
    easy_sec_per_km: Math.round(race_pace_sec_per_km * 1.25),
    interval_sec_per_km: Math.round(race_pace_sec_per_km * 0.93),
  };
}

export interface HyroxSplits {
  run_pace_sec_per_km: number;
  station_total_seconds: number;
  run_total_seconds: number;
  per_km_split_seconds: number;
}

export function calcHyroxSplits(goalTimeSeconds: number): HyroxSplits {
  const stationTotal = Object.values(HYROX_STATION_SECONDS).reduce((a, b) => a + b, 0);
  const runTotal = goalTimeSeconds - stationTotal;
  const runPaceSecPerKm = runTotal / 8;
  return {
    run_pace_sec_per_km: Math.round(runPaceSecPerKm),
    station_total_seconds: stationTotal,
    run_total_seconds: Math.max(0, runTotal),
    per_km_split_seconds: Math.round(runPaceSecPerKm),
  };
}

export function calcActualPace(distanceKm: number, durationMinutes: number): number {
  if (!distanceKm || !durationMinutes) return 0;
  return Math.round((durationMinutes * 60) / distanceKm);
}

export function paceToMinKm(secondsPerKm: number): string {
  const m = Math.floor(secondsPerKm / 60);
  const s = secondsPerKm % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
