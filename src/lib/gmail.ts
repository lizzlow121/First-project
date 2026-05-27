import type { Integration } from "@/types";
import type { GoogleTokens } from "./google-calendar";

export { type GoogleTokens };

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

const SUPPLEMENT_QUERY =
  "from:(amazon.com OR iherb.com OR bulksupplements.com OR myprotein.com) subject:(order OR confirmation OR shipped)";

export interface GmailMessage {
  id: string;
  threadId: string;
}

export async function searchSupplementEmails(
  accessToken: string
): Promise<GmailMessage[]> {
  const url = new URL("https://www.googleapis.com/gmail/v1/users/me/messages");
  url.searchParams.set("q", SUPPLEMENT_QUERY);
  url.searchParams.set("maxResults", "10");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`searchSupplementEmails failed: ${res.status}`);
  const data = await res.json();
  return data.messages ?? [];
}

export async function fetchMessageBody(
  accessToken: string,
  messageId: string
): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`fetchMessageBody failed: ${res.status}`);
  const data = await res.json();

  // Extract plain text from payload parts
  const extractText = (payload: {
    mimeType?: string;
    body?: { data?: string };
    parts?: unknown[];
  }): string => {
    if (payload.mimeType === "text/plain" && payload.body?.data) {
      // base64url decode
      const base64 = payload.body.data.replace(/-/g, "+").replace(/_/g, "/");
      try {
        return Buffer.from(base64, "base64").toString("utf-8");
      } catch {
        return "";
      }
    }
    if (payload.parts && Array.isArray(payload.parts)) {
      for (const part of payload.parts as typeof payload[]) {
        const text = extractText(part);
        if (text) return text;
      }
    }
    return "";
  };

  const text = extractText(data.payload ?? {});
  // Trim to avoid sending huge emails to Claude
  return text.substring(0, 4000);
}
