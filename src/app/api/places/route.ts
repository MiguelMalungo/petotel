import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/api";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    try {
        const data = await searchPlaces(query);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch places" },
            { status: 500 }
        );
    }
}
