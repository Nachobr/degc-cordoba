import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const filePath = path.join(process.cwd(), "data", "sueldos.json");
    const jsonData = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(jsonData);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading sueldos data:", error);
    return NextResponse.json(
      { error: "Error fetching sueldos data" },
      { status: 500 }
    );
  }
}