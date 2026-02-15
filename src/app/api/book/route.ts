import { NextResponse } from "next/server";
import { book } from "@/lib/api";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await book(body);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error booking:", error);
        return NextResponse.json(
            { error: "Failed to book" },
            { status: 500 }
        );
    }
}
