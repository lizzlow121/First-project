import { NextRequest, NextResponse } from "next/server";
import { parseTrainingScreenshot } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type as "image/jpeg" | "image/png" | "image/webp";

    const result = await parseTrainingScreenshot(base64, mimeType);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Screenshot import error:", error);
    return NextResponse.json({ error: "Failed to parse screenshot" }, { status: 500 });
  }
}
