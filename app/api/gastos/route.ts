import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year") || "2024";
  const monthParam = searchParams.get("month") || "02";

  const year = parseInt(yearParam);
  const month = parseInt(monthParam);
  const formattedMonth = month.toString().padStart(2, "0");

  const url = `https://transparencia.cba.gov.ar/HandlerSueldos.ashx?anio=${year}&mes=${formattedMonth}&rows=5&page=1&sidx=invdate&sord=desc`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/xml",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    if (!xmlText || xmlText.trim().length === 0) {
      throw new Error("Received empty response from server");
    }

    const parser = new XMLParser({
      ignoreAttributes: true,
      parseTagValue: false,
    });
    const jsonData = parser.parse(xmlText);

    const rows = jsonData.rows?.row || [];
    const data = (Array.isArray(rows) ? rows : [rows]).map((row: any) => ({
      jurisdiccion: row.cell[0] || "Sin Jurisdicción",
      unidadOrganigrama: row.cell[1] || "Sin Unidad",
      unidadSuperior: row.cell[2] || "Sin Superior",
      cargo: row.cell[3] || "Sin Cargo",
      montoBruto: parseInt(row.cell[4] || "0"),
      aportesPersonales: parseInt(row.cell[5] || "0"),
      contribucionesPatronales: parseInt(row.cell[6] || "0"),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
