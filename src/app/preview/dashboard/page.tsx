import { RaceReadinessHero } from "@/components/dashboard/RaceReadinessHero";
import { DimensionCard } from "@/components/dashboard/DimensionCard";
import { WeeklyTrainingCard } from "@/components/dashboard/WeeklyTrainingCard";
import { MacroRingCard } from "@/components/dashboard/MacroRingCard";
import { MotivationCard } from "@/components/dashboard/MotivationCard";
import { CalendarDays, Utensils, Heart, Pill, Droplets, Plus } from "lucide-react";
import type { Race, TrainingSession } from "@/types";
import { addDays, format, addMinutes } from "date-fns";

// Demo data — no DB needed
const demoRace: Race = {
  id: "demo",
  user_id: "demo",
  name: "Hyrox London",
  race_type: "hyrox",
  race_subtype: "hyrox_open",
  race_date: format(addDays(new Date(), 28), "yyyy-MM-dd"),
  location: "ExCeL London",
  distance_km: 8,
  goal_time_seconds: 3900,
  current_fitness: "intermediate",
  notes: null,
  actual_finish_time_seconds: null,
  result_rating: null,
  result_notes: null,
  result_logged_at: null,
  created_at: new Date().toISOString(),
};

const today = new Date();
const monday = addDays(today, -((today.getDay() + 6) % 7));
const demoSessions: TrainingSession[] = [
  { id: "1", user_id: "demo", race_id: "demo", session_date: format(monday, "yyyy-MM-dd"), title: "Easy run", session_type: "run", duration_minutes: 45, distance_km: 7.5, perceived_effort: 4, pace_per_km_seconds: 360, notes: null, source: "manual", external_id: null, created_at: "" },
  { id: "2", user_id: "demo", race_id: "demo", session_date: format(addDays(monday, 1), "yyyy-MM-dd"), title: "Strength A", session_type: "strength", duration_minutes: 60, distance_km: null, perceived_effort: 7, pace_per_km_seconds: null, notes: null, source: "manual", external_id: null, created_at: "" },
  { id: "3", user_id: "demo", race_id: "demo", session_date: format(addDays(monday, 3), "yyyy-MM-dd"), title: "Intervals 6x400m", session_type: "run", duration_minutes: 50, distance_km: 8, perceived_effort: 9, pace_per_km_seconds: 300, notes: null, source: "manual", external_id: null, created_at: "" },
  { id: "4", user_id: "demo", race_id: "demo", session_date: format(addDays(monday, 5), "yyyy-MM-dd"), title: "Hyrox sim", session_type: "hyrox", duration_minutes: 75, distance_km: null, perceived_effort: 8, pace_per_km_seconds: null, notes: null, source: "manual", external_id: null, created_at: "" },
  { id: "5", user_id: "demo", race_id: "demo", session_date: format(addDays(monday, 6), "yyyy-MM-dd"), title: "Long run", session_type: "run", duration_minutes: 90, distance_km: 15, perceived_effort: 5, pace_per_km_seconds: 360, notes: null, source: "manual", external_id: null, created_at: "" },
];

export default function PreviewDashboard() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <RaceReadinessHero race={demoRace} readinessScore={72} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <DimensionCard status="green" label="Training" value="5/5 sessions" trend={[]} icon={<CalendarDays className="h-4 w-4" />} />
          <DimensionCard status="amber" label="Nutrition" value="4/7 days on target" trend={[]} icon={<Utensils className="h-4 w-4" />} />
          <DimensionCard status="green" label="Recovery" value="7.8/10 avg energy" trend={[]} icon={<Heart className="h-4 w-4" />} />
          <DimensionCard status="amber" label="Supplements" value="5/7 days complete" trend={[]} icon={<Pill className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WeeklyTrainingCard sessions={demoSessions} />
          <MacroRingCard
            totals={{ calories: 1840, protein_g: 142, carbs_g: 195, fat_g: 58 }}
            goals={{ id: "", user_id: "", calories_target: 2400, protein_g: 180, carbs_g: 250, fat_g: 70, updated_at: "" }}
          />
          <StaticHydrationCard />
          <MotivationCard
            quote={{ q: "The body achieves what the mind believes.", a: "Napoleon Hill" }}
            podcast={{ name: "Brute Strength", host: "Michael Cazayoux", description: "Functional fitness, Hyrox, and CrossFit training for competitive athletes.", url: "https://example.com", category: "hyrox" }}
          />
        </div>
      </div>
    </div>
  );
}

function StaticHydrationCard() {
  return (
    <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          <Droplets className="h-3 w-3" />
          Hydration
        </div>
        <span className="text-xs text-[var(--color-text-secondary)] tabular-nums">58%</span>
      </div>
      <div className="space-y-2">
        <div className="text-center py-1">
          <span className="text-3xl font-bold tabular-nums">1.75L</span>
          <span className="text-sm text-[var(--color-text-muted)] ml-1.5">/ 3.0L</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--color-surface-3)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500" style={{ width: "58%" }} />
        </div>
      </div>
      <div className="flex gap-2">
        {["250ml", "500ml", "750ml"].map((label) => (
          <button key={label} className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]">
            <Plus className="h-3 w-3" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
