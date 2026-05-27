import { NextRequest, NextResponse } from "next/server";
import { generateTrainingPlan, type TrainingPlanInput } from "@/lib/claude";
import { createClient } from "@/lib/supabase/server";
import type { TrainingPlanWeek } from "@/types";
import { format, parseISO, nextDay, Day } from "date-fns";

const DAY_MAP: Record<string, Day> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

function sessionDateFromWeek(weekStart: string, dayName: string): string {
  const start = parseISO(weekStart);
  const dayNum = DAY_MAP[dayName.toLowerCase()];
  if (dayNum === undefined) return weekStart;
  const target = nextDay(start, dayNum as Day);
  return format(target, "yyyy-MM-dd");
}

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as TrainingPlanInput;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weeks: TrainingPlanWeek[] = await generateTrainingPlan(input);

    if (!weeks || weeks.length === 0) {
      return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
    }

    const sessionsToInsert = weeks.flatMap((week) =>
      week.sessions.map((session) => ({
        user_id: user.id,
        session_date: sessionDateFromWeek(week.start_date, session.day),
        title: session.title,
        session_type: session.session_type,
        duration_minutes: session.duration_minutes,
        distance_km: session.distance_km ?? null,
        perceived_effort: null,
        pace_per_km_seconds: null,
        notes: session.coaching_note,
        source: "ai_generated" as const,
        external_id: null,
        race_id: null,
      }))
    );

    const { error } = await supabase.from("training_sessions").insert(sessionsToInsert);

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "Failed to save plan" }, { status: 500 });
    }

    return NextResponse.json({
      weeks: weeks.length,
      sessionsCreated: sessionsToInsert.length,
    });
  } catch (error) {
    console.error("Generate plan error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
