import { NextResponse } from "next/server";
import { prebook } from "@/lib/api";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { offerId } = body;

        if (!offerId) {
            return NextResponse.json({ error: "Offer ID required" }, { status: 400 });
        }

        const data = await prebook(offerId);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error prebooking:", error);
        return NextResponse.json(
            { error: "Failed to prebook" },
            { status: 500 }
        );
    }
}
