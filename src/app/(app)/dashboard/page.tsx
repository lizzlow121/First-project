import { createClient } from "@/lib/supabase/server";
import { RaceReadinessHero } from "@/components/dashboard/RaceReadinessHero";
import { DimensionCard } from "@/components/dashboard/DimensionCard";
import { WeeklyTrainingCard } from "@/components/dashboard/WeeklyTrainingCard";
import { MacroRingCard } from "@/components/dashboard/MacroRingCard";
import { MotivationCard } from "@/components/dashboard/MotivationCard";
import { HydrationCard } from "@/components/dashboard/HydrationCard";
import { getDailyQuote } from "@/lib/quotes";
import { getDailyPodcast } from "@/lib/podcasts";
import {
  trainingConsistencyStatus,
  nutritionStatus,
  recoveryStatus,
  supplementStatus,
  computeReadinessScore,
} from "@/lib/readiness";
import { subDays, format, startOfWeek, endOfWeek } from "date-fns";
import { CalendarDays, Utensils, Heart, Pill } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(today, 7), "yyyy-MM-dd");

  // Parallel data fetch
  const [
    racesRes,
    weekSessionsRes,
    foodLogsRes,
    goalsRes,
    recoveryRes,
    supplRes,
    supplLogsRes,
    quoteResult,
  ] = await Promise.all([
    supabase.from("races").select("*").gte("race_date", format(today, "yyyy-MM-dd")).order("race_date").limit(1),
    supabase.from("training_sessions").select("*").gte("session_date", weekStart).lte("session_date", weekEnd),
    supabase.from("food_logs").select("calories,protein_g,carbs_g,fat_g,log_date").gte("log_date", sevenDaysAgo),
    supabase.from("nutrition_goals").select("*").single(),
    supabase.from("recovery_logs").select("energy").gte("log_date", sevenDaysAgo),
    supabase.from("supplements").select("id").eq("active", true),
    supabase.from("supplement_logs").select("taken_date,supplement_id").gte("taken_date", sevenDaysAgo),
    getDailyQuote(),
  ]);

  const nextRace = racesRes.data?.[0] ?? null;
  const weekSessions = weekSessionsRes.data ?? [];
  const foodLogs = foodLogsRes.data ?? [];
  const goals = goalsRes.data ?? null;
  const recoveryLogs = recoveryRes.data ?? [];
  const supplements = supplRes.data ?? [];
  const supplementLogs = supplLogsRes.data ?? [];
  const podcast = getDailyPodcast();

  // Macro totals for today
  const todayStr = format(today, "yyyy-MM-dd");
  const todayFoods = foodLogs.filter((f) => f.log_date === todayStr);
  const totals = todayFoods.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories ?? 0),
      protein_g: acc.protein_g + (f.protein_g ?? 0),
      carbs_g: acc.carbs_g + (f.carbs_g ?? 0),
      fat_g: acc.fat_g + (f.fat_g ?? 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  // Readiness dimensions
  const plannedSessions = weekSessions.filter((s) => s.source === "ai_generated").length;
  const completedSessions = weekSessions.filter((s) => s.source !== "ai_generated").length;

  // Nutrition: count days this week where calories >= 80% of goal
  const calTarget = goals?.calories_target ?? 2000;
  const daysWithFoodData = new Set(foodLogs.filter((f) => {
    const dayTotal = foodLogs.filter((ff) => ff.log_date === f.log_date).reduce((s, ff) => s + (ff.calories ?? 0), 0);
    return dayTotal >= calTarget * 0.8;
  }).map((f) => f.log_date)).size;

  const avgEnergy = recoveryLogs.length > 0
    ? recoveryLogs.reduce((s, r) => s + (r.energy ?? 0), 0) / recoveryLogs.filter((r) => r.energy !== null).length
    : null;

  const uniqueSupplDays = supplements.length > 0
    ? new Set(
        supplementLogs
          .filter((sl) => {
            const dayLogs = supplementLogs.filter((l) => l.taken_date === sl.taken_date);
            return dayLogs.length >= supplements.length;
          })
          .map((sl) => sl.taken_date)
      ).size
    : 0;

  const dimensions = [
    trainingConsistencyStatus(completedSessions, plannedSessions || weekSessions.length),
    nutritionStatus(daysWithFoodData, 7),
    recoveryStatus(avgEnergy),
    supplementStatus(uniqueSupplDays, 7),
  ];
  const readinessScore = computeReadinessScore(dimensions);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Hero */}
      <RaceReadinessHero race={nextRace} readinessScore={readinessScore} />

      {/* Progress grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DimensionCard {...dimensions[0]} icon={<CalendarDays className="h-4 w-4" />} />
        <DimensionCard {...dimensions[1]} icon={<Utensils className="h-4 w-4" />} />
        <DimensionCard {...dimensions[2]} icon={<Heart className="h-4 w-4" />} />
        <DimensionCard {...dimensions[3]} icon={<Pill className="h-4 w-4" />} />
      </div>

      {/* Secondary grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <WeeklyTrainingCard sessions={weekSessions} />
        <MacroRingCard totals={totals} goals={goals} />
        <HydrationCard />
        <MotivationCard quote={quoteResult} podcast={podcast} />
      </div>
    </div>
  );
}
