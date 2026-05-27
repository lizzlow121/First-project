import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const JOURNAL_SYSTEM = `You are a thoughtful sports coach and wellness guide helping a busy everyday athlete reflect on their training and life.
Generate short, specific, insightful journal prompts that help the athlete process their day.
Be direct, warm, and focused on growth. Avoid generic questions.`;

export interface JournalContext {
  sessions: { title: string; session_type: string; duration_minutes: number | null; perceived_effort: number | null; distance_km: number | null }[];
  raceName: string | null;
  daysToRace: number | null;
  recoveryScore: number | null;
  energyLevel: number | null;
  morningIntention: string | null;
}

export async function generateJournalPrompts(context: JournalContext): Promise<string[]> {
  const contextSummary = buildContextSummary(context);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: [
      {
        type: "text",
        text: JOURNAL_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Based on this athlete's day, generate exactly 3 short journal prompts (1 sentence each). Return only a JSON array of 3 strings, nothing else.\n\nContext:\n${contextSummary}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  try {
    const parsed = JSON.parse(text.trim());
    if (Array.isArray(parsed) && parsed.length >= 3) return parsed.slice(0, 3);
  } catch {
    // Parse failed — extract lines
  }
  return text.split("\n").filter((l) => l.trim()).slice(0, 3);
}

function buildContextSummary(ctx: JournalContext): string {
  const lines: string[] = [];
  if (ctx.sessions.length > 0) {
    const s = ctx.sessions[0];
    lines.push(`Training today: ${s.title} (${s.session_type}, ${s.duration_minutes ?? "?"}min, effort ${s.perceived_effort ?? "??"}/10${s.distance_km ? `, ${s.distance_km}km` : ""})`);
  } else {
    lines.push("No training logged today (rest day or missed)");
  }
  if (ctx.raceName && ctx.daysToRace !== null) {
    lines.push(`Upcoming race: ${ctx.raceName} in ${ctx.daysToRace} days`);
  }
  if (ctx.recoveryScore !== null) lines.push(`Recovery score: ${ctx.recoveryScore}/10`);
  if (ctx.energyLevel !== null) lines.push(`Energy today: ${ctx.energyLevel}/10`);
  if (ctx.morningIntention) lines.push(`Morning intention: "${ctx.morningIntention}"`);
  return lines.join("\n");
}

export interface TrainingScreenshotResult {
  title: string;
  session_type: string;
  duration_minutes: number | null;
  distance_km: number | null;
  exercises: { name: string; sets?: number; reps?: number; weight?: string; notes?: string }[];
  notes: string | null;
}

export async function parseTrainingScreenshot(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp"
): Promise<TrainingScreenshotResult> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mimeType, data: imageBase64 },
          },
          {
            type: "text",
            text: `Extract the training session from this image. Return ONLY a JSON object with these fields:
{
  "title": "session name",
  "session_type": "run|ride|swim|strength|hyrox|other",
  "duration_minutes": number or null,
  "distance_km": number or null,
  "exercises": [{"name":"...", "sets":number, "reps":number, "weight":"...", "notes":"..."}],
  "notes": "any other details or null"
}`,
          },
        ],
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // Return minimal fallback
  }
  return {
    title: "Imported session",
    session_type: "other",
    duration_minutes: null,
    distance_km: null,
    exercises: [],
    notes: text.substring(0, 200),
  };
}

export interface TrainingPlanInput {
  raceName: string;
  raceType: string;
  distanceKm: number;
  goalTimeSeconds: number;
  weeksAvailable: number;
  fitnessLevel: string;
  recentSessions: { session_type: string; distance_km: number | null; duration_minutes: number | null }[];
}

export async function generateTrainingPlan(input: TrainingPlanInput): Promise<import("@/types").TrainingPlanWeek[]> {
  const { raceName, raceType, distanceKm, goalTimeSeconds, weeksAvailable, fitnessLevel, recentSessions } = input;
  const goalMin = Math.floor(goalTimeSeconds / 60);
  const goalHour = Math.floor(goalMin / 60);
  const goalRemMin = goalMin % 60;
  const goalStr = goalHour > 0 ? `${goalHour}h ${goalRemMin}m` : `${goalMin}m`;

  const recentSummary = recentSessions.slice(0, 10).map(s =>
    `${s.session_type}${s.distance_km ? ` ${s.distance_km}km` : ""}${s.duration_minutes ? ` ${s.duration_minutes}min` : ""}`
  ).join(", ");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: "You are an expert endurance and functional fitness coach. Generate structured training plans as JSON only.",
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Generate a ${weeksAvailable}-week training plan for this athlete. Return ONLY a JSON array.

Race: ${raceName} (${raceType}, ${distanceKm}km)
Goal time: ${goalStr}
Fitness level: ${fitnessLevel}
Recent training: ${recentSummary || "none"}

Return JSON array of week objects:
[{
  "week_number": 1,
  "start_date": "YYYY-MM-DD",
  "sessions": [{
    "day": "Monday",
    "title": "...",
    "session_type": "run|strength|hyrox|rest|other",
    "duration_minutes": number,
    "distance_km": number or null,
    "pace_zone": "easy|tempo|race|interval" or null,
    "coaching_note": "one sentence"
  }]
}]

Start week 1 from today. Build progressive overload. Include rest days. Taper last 1-2 weeks.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
  return [];
}
