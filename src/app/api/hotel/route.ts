import { NextResponse } from "next/server";
import { getHotelDetails } from "@/lib/api";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get("hotelId");

    if (!hotelId) {
        return NextResponse.json({ error: "Hotel ID required" }, { status: 400 });
    }

    try {
        const data = await getHotelDetails(hotelId);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching hotel details:", error);
        return NextResponse.json(
            { error: "Failed to fetch hotel details" },
            { status: 500 }
        );
    }
}
