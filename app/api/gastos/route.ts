import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Import JSON directly instead of using fs
    const data = await import("../../../data/sueldos.json");
    return NextResponse.json(data.default);
  } catch (error) {
    console.error("Error reading sueldos data:", error);
    return NextResponse.json(
      { error: "Error fetching sueldos data" },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';