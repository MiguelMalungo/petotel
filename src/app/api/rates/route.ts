import { NextRequest, NextResponse } from "next/server";
import { searchRates } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await searchRates(body);
  return NextResponse.json(result);
}
