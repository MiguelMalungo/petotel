import { NextRequest, NextResponse } from "next/server";
import { getHotelDetails } from "@/lib/api";

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get("hotelId");
  if (!hotelId) {
    return NextResponse.json({ error: "hotelId is required" }, { status: 400 });
  }
  const result = await getHotelDetails(hotelId);
  return NextResponse.json(result);
}
