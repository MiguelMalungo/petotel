import { NextRequest, NextResponse } from "next/server";
import { prebook } from "@/lib/api";

export async function POST(req: NextRequest) {
  const { offerId } = await req.json();
  if (!offerId) {
    return NextResponse.json({ error: "offerId is required" }, { status: 400 });
  }
  const result = await prebook(offerId);
  return NextResponse.json(result);
}
