import type { Integration } from "@/types";

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: string;
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  status?: string;
}

export async function refreshGoogleToken(
  integration: Integration
): Promise<GoogleTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: integration.refresh_token ?? "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status}`);
  }
  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    expires_at: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : undefined,
  };
}

export async function listCalendars(accessToken: string): Promise<GoogleCalendar[]> {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`listCalendars failed: ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

export async function fetchEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarEvent[]> {
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
  );
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`fetchEvents failed: ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

export async function createEvent(
  accessToken: string,
  calendarId: string,
  event: Partial<GoogleCalendarEvent>
): Promise<GoogleCalendarEvent> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );
  if (!res.ok) throw new Error(`createEvent failed: ${res.status}`);
  return res.json();
}

export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: Partial<GoogleCalendarEvent>
): Promise<GoogleCalendarEvent> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );
  if (!res.ok) throw new Error(`updateEvent failed: ${res.status}`);
  return res.json();
}

const TRAINING_KEYWORDS = [
  "run",
  "running",
  "gym",
  "ride",
  "riding",
  "cycling",
  "cycle",
  "hyrox",
  "swim",
  "swimming",
  "workout",
  "training",
  "crossfit",
  "hiit",
  "yoga",
  "pilates",
  "strength",
  "weightlifting",
  "weights",
  "walk",
  "walking",
  "hike",
  "hiking",
  "race",
  "marathon",
  "triathlon",
  "parkrun",
  "spartan",
  "ocr",
];

export function isTrainingEvent(title?: string): boolean {
  if (!title) return false;
  const lower = title.toLowerCase();
  return TRAINING_KEYWORDS.some((kw) => lower.includes(kw));
}
