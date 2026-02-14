import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/api";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ data: [] });
  const result = await searchPlaces(q);
  return NextResponse.json(result);
}
