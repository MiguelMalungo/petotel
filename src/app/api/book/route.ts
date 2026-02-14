import { NextRequest, NextResponse } from "next/server";
import { book } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await book(body);
  return NextResponse.json(result);
}
