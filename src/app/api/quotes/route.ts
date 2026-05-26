import { NextResponse } from "next/server";
import { getDailyQuote } from "@/lib/quotes";

export async function GET() {
  const quote = await getDailyQuote();
  return NextResponse.json(quote);
}
