import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year") || "2024";
  const monthParam = searchParams.get("month") || "02";

  try {
    // Read from the JSON file created by the worker
    const dataPath = path.join(process.cwd(), 'public', 'data', 'gastos.json');
    const jsonData = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(jsonData);

    // Get data for the requested year and month
    const monthlyData = data[yearParam]?.[monthParam] || [];

    return new NextResponse(JSON.stringify(monthlyData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });

  } catch (error) {
    console.error("Error reading data:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Error al leer los datos",
        timestamp: new Date().toISOString(),
        params: { yearParam, monthParam }
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}