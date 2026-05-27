import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${appUrl}/integrations?error=no_code`);
  }

  try {
    const redirectUri = `${appUrl}/api/auth/whoop/callback`;

    const tokenRes = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.WHOOP_CLIENT_ID ?? "",
        client_secret: process.env.WHOOP_CLIENT_SECRET ?? "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) throw new Error("Token exchange failed");

    const tokens = await tokenRes.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.redirect(`${appUrl}/login`);

    await supabase.from("integrations").upsert(
      {
        user_id: user.id,
        provider: "whoop",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        scope: "read:recovery read:sleep read:workout",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" }
    );

    return NextResponse.redirect(`${appUrl}/integrations?connected=whoop`);
  } catch (error) {
    console.error("Whoop callback error:", error);
    return NextResponse.redirect(`${appUrl}/integrations?error=whoop_failed`);
  }
}
