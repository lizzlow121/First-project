import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  refreshGoogleToken,
  fetchEvents,
  createEvent,
  isTrainingEvent,
} from "@/lib/google-calendar";
import { format, subDays, addDays } from "date-fns";

function eventDurationMinutes(event: {
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}): number | null {
  const startStr = event.start?.dateTime ?? event.start?.date;
  const endStr = event.end?.dateTime ?? event.end?.date;
  if (!startStr || !endStr) return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return null;
  return Math.round(diff / 60000);
}

function eventDate(event: {
  start?: { dateTime?: string; date?: string };
}): string {
  const startStr = event.start?.dateTime ?? event.start?.date;
  if (!startStr) return format(new Date(), "yyyy-MM-dd");
  return format(new Date(startStr), "yyyy-MM-dd");
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google_calendar")
      .single();

    if (!integration) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    let accessToken = integration.access_token;

    // Refresh token if expired
    if (
      integration.expires_at &&
      new Date(integration.expires_at) < new Date()
    ) {
      const newTokens = await refreshGoogleToken(integration);
      accessToken = newTokens.access_token;
      await supabase
        .from("integrations")
        .update({
          access_token: newTokens.access_token,
          ...(newTokens.refresh_token
            ? { refresh_token: newTokens.refresh_token }
            : {}),
          expires_at: newTokens.expires_at ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);
    }

    const calendarId = integration.gcal_calendar_id ?? "primary";
    const today = new Date();
    const timeMin = subDays(today, 30).toISOString();
    const timeMax = addDays(today, 90).toISOString();

    // Fetch events from Google Calendar
    const events = await fetchEvents(accessToken, calendarId, timeMin, timeMax);

    // Import training events into training_sessions
    const importSessions = events
      .filter((e) => isTrainingEvent(e.summary))
      .map((e) => ({
        user_id: user.id,
        session_date: eventDate(e),
        title: e.summary ?? "Training",
        session_type: "other" as const,
        duration_minutes: eventDurationMinutes(e),
        source: "google_calendar" as const,
        external_id: e.id,
        race_id: null,
      }));

    let imported = 0;
    if (importSessions.length > 0) {
      const { error } = await supabase
        .from("training_sessions")
        .upsert(importSessions, { onConflict: "user_id,external_id" });
      if (error) throw error;
      imported = importSessions.length;
    }

    // Export pending training sessions (no external_id, not from google_calendar) to Google Calendar
    const { data: pendingSessions } = await supabase
      .from("training_sessions")
      .select("*")
      .eq("user_id", user.id)
      .is("external_id", null)
      .neq("source", "google_calendar")
      .gte("session_date", format(subDays(today, 30), "yyyy-MM-dd"))
      .lte("session_date", format(addDays(today, 90), "yyyy-MM-dd"));

    let exported = 0;
    for (const session of pendingSessions ?? []) {
      try {
        const startDateTime = new Date(
          session.session_date + "T09:00:00"
        ).toISOString();
        const durationMs = (session.duration_minutes ?? 60) * 60 * 1000;
        const endDateTime = new Date(
          new Date(startDateTime).getTime() + durationMs
        ).toISOString();

        const createdEvent = await createEvent(accessToken, calendarId, {
          summary: session.title,
          description: session.notes ?? undefined,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
        });

        // Update the training session with the new external_id
        await supabase
          .from("training_sessions")
          .update({ external_id: createdEvent.id })
          .eq("id", session.id);

        exported++;
      } catch {
        // Continue with other sessions on error
      }
    }

    // Update last_synced_at
    await supabase
      .from("integrations")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", integration.id);

    return NextResponse.json({ imported, exported });
  } catch (error) {
    console.error("Google Calendar sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
