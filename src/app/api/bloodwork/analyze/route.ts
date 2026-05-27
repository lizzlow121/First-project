import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BLOODWORK_SYSTEM = `You are an expert sports nutritionist and functional medicine analyst helping everyday athletes optimise their health and performance. You analyse bloodwork results and provide detailed, actionable supplement recommendations.

Always structure your response as valid JSON only — no markdown, no prose outside the JSON.`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or image (JPG, PNG, WebP)." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Fetch user's active supplements from Supabase
    const { data: supplements } = await supabase
      .from("supplements")
      .select("name, dose")
      .eq("user_id", user.id)
      .eq("active", true);

    const supplementsList =
      supplements && supplements.length > 0
        ? supplements.map((s) => `${s.name}${s.dose ? ` (${s.dose})` : ""}`).join(", ")
        : "None currently";

    // Build the file content block depending on type
    type ImageMediaType = "image/jpeg" | "image/png" | "image/webp";
    const fileContentBlock =
      file.type === "application/pdf"
        ? {
            type: "document" as const,
            source: {
              type: "base64" as const,
              media_type: "application/pdf" as const,
              data: base64,
            },
          }
        : {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: file.type as ImageMediaType,
              data: base64,
            },
          };

    const userPrompt = `Analyse this bloodwork report for an athlete. The athlete currently takes these supplements: ${supplementsList}.

Return ONLY a JSON object with this exact structure:
{
  "summary": "2-3 sentence overall assessment focused on athletic performance",
  "markers": [
    {
      "name": "marker name",
      "value": "the actual value with units",
      "status": "optimal" | "low" | "high" | "deficient" | "elevated",
      "reference_range": "the reference range shown",
      "athletic_impact": "2-3 sentences explaining what this means for training, recovery, and performance",
      "priority": "high" | "medium" | "low"
    }
  ],
  "suggestions": [
    {
      "action": "add" | "increase" | "decrease" | "remove" | "maintain",
      "supplement": "supplement name",
      "dose": "specific dose e.g. 18mg daily",
      "timing": "e.g. morning with food",
      "reason": "2-3 sentences linking this to the specific bloodwork markers",
      "markers_addressed": ["marker name 1", "marker name 2"]
    }
  ],
  "already_optimal": [
    {
      "supplement": "name of supplement already being taken that is well-covered",
      "assessment": "one sentence confirming it is appropriate based on results"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: [
        {
          type: "text",
          text: BLOODWORK_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            fileContentBlock,
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let parsedResult;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found");
      parsedResult = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse analysis response", raw: rawText },
        { status: 422 }
      );
    }

    // Save to bloodwork_analyses table
    const { data: savedRecord, error: dbError } = await supabase
      .from("bloodwork_analyses")
      .insert({
        user_id: user.id,
        filename: file.name,
        summary: parsedResult.summary ?? null,
        analysis: parsedResult,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json(savedRecord);
  } catch (error) {
    console.error("Bloodwork analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyse bloodwork" },
      { status: 500 }
    );
  }
}
