import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { StravaActivity } from "@/types";
import { format } from "date-fns";

async function refreshStravaToken(
  refreshToken: string
): Promise<{ access_token: string; refresh_token: string; expires_at: number }> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Token refresh failed");
  return res.json();
}

function stravaTypeToSession(stravaType: string): string {
  const map: Record<string, string> = {
    Run: "run",
    Ride: "ride",
    Swim: "swim",
    WeightTraining: "strength",
    Yoga: "yoga",
  };
  return map[stravaType] ?? "other";
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "strava")
      .single();

    if (!integration) {
      return NextResponse.json({ error: "Strava not connected" }, { status: 400 });
    }

    let accessToken = integration.access_token;

    // Refresh token if expired
    if (integration.expires_at && new Date(integration.expires_at) < new Date()) {
      const newTokens = await refreshStravaToken(integration.refresh_token ?? "");
      accessToken = newTokens.access_token;
      await supabase
        .from("integrations")
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: new Date(newTokens.expires_at * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);
    }

    // Fetch activities
    const activitiesRes = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=20",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!activitiesRes.ok) {
      throw new Error("Failed to fetch Strava activities");
    }

    const activities = (await activitiesRes.json()) as StravaActivity[];

    // Upsert to training_sessions
    const sessions = activities.map((a) => ({
      user_id: user.id,
      session_date: format(new Date(a.start_date), "yyyy-MM-dd"),
      title: a.name,
      session_type: stravaTypeToSession(a.type),
      duration_minutes: Math.round(a.moving_time / 60),
      distance_km: a.distance > 0 ? Math.round(a.distance / 100) / 10 : null,
      perceived_effort: null,
      pace_per_km_seconds:
        a.distance > 0
          ? Math.round(a.moving_time / (a.distance / 1000))
          : null,
      notes: null,
      source: "strava" as const,
      external_id: String(a.id),
      race_id: null,
    }));

    const { error } = await supabase
      .from("training_sessions")
      .upsert(sessions, { onConflict: "user_id,external_id" });

    if (error) throw error;

    // Update last synced
    await supabase
      .from("integrations")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", integration.id);

    return NextResponse.json({ synced: sessions.length });
  } catch (error) {
    console.error("Strava sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
