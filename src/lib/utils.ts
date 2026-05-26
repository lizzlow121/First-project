import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInSeconds, getDayOfYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCountdown(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = differenceInSeconds(targetDate, new Date());
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds, total };
}

export function formatPace(secondsPerKm: number, unit: "km" | "mile" = "km"): string {
  const secs = unit === "mile" ? secondsPerKm * 1.60934 : secondsPerKm;
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")} /${unit}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatGoalTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function parseGoalTime(str: string): number {
  const parts = str.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function dayOfYear(): number {
  return getDayOfYear(new Date());
}

export function weeksUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
}

export function sessionTypeColor(type: string): string {
  const map: Record<string, string> = {
    run: "bg-blue-500",
    ride: "bg-cyan-500",
    swim: "bg-sky-400",
    strength: "bg-orange-500",
    hyrox: "bg-yellow-400",
    ocr: "bg-green-500",
    yoga: "bg-purple-400",
    rest: "bg-zinc-600",
    other: "bg-zinc-500",
  };
  return map[type] ?? "bg-zinc-500";
}

export function effortColor(effort: number): string {
  if (effort <= 3) return "text-green-400";
  if (effort <= 6) return "text-amber-400";
  return "text-red-400";
}
