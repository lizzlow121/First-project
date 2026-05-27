import { NextRequest, NextResponse } from "next/server";
import { generateJournalPrompts, type JournalContext } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const context = (await req.json()) as JournalContext;
    const prompts = await generateJournalPrompts(context);
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Journal prompts error:", error);
    return NextResponse.json({ error: "Failed to generate prompts" }, { status: 500 });
  }
}
