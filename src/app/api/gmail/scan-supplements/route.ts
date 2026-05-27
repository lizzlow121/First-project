import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  refreshGoogleToken,
  searchSupplementEmails,
  fetchMessageBody,
} from "@/lib/gmail";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface SupplementSuggestion {
  name: string;
  quantity: string | null;
  brand: string | null;
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
      .eq("provider", "gmail")
      .single();

    if (!integration) {
      return NextResponse.json(
        { error: "Gmail not connected" },
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

    // Search for supplement order emails
    const messages = await searchSupplementEmails(accessToken);

    // Process up to 5 messages
    const messagesToProcess = messages.slice(0, 5);

    const allSuggestions: SupplementSuggestion[] = [];

    for (const message of messagesToProcess) {
      try {
        const body = await fetchMessageBody(accessToken, message.id);
        if (!body.trim()) continue;

        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: `Extract supplement product names and quantities from this order email. Return JSON array of {name, quantity, brand}. If you cannot find any supplements, return an empty array [].

Email:
${body}

Return ONLY a valid JSON array, no other text.`,
            },
          ],
        });

        const text =
          response.content[0].type === "text" ? response.content[0].text : "[]";

        try {
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed)) {
              allSuggestions.push(...parsed);
            }
          }
        } catch {
          // Skip malformed responses
        }
      } catch {
        // Continue with other messages on error
      }
    }

    // Deduplicate by name (case-insensitive)
    const seen = new Set<string>();
    const suggestions = allSuggestions.filter((s) => {
      if (!s.name) return false;
      const key = s.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Gmail supplement scan error:", error);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
