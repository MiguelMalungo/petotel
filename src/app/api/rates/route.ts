import { NextResponse } from "next/server";
import { searchRates } from "@/lib/api";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await searchRates(body);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching rates:", error);
        return NextResponse.json(
            { error: "Failed to fetch rates" },
            { status: 500 }
        );
    }
}
