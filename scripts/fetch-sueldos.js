const { XMLParser } = require("fast-xml-parser");
const fs = require("fs").promises;

async function fetchAndStoreSueldos() {
  const year = process.env.YEAR || "2025";
  const month = process.env.MONTH || "01";
  const formattedMonth = month.padStart(2, "0");
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
    const data = (Array.isArray(rows) ? rows : [rows]).map((row) => ({
      jurisdiccion: row.cell[0] || "Sin Jurisdicción",
      unidadOrganigrama: row.cell[1] || "Sin Unidad",
      unidadSuperior: row.cell[2] || "Sin Superior",
      cargo: row.cell[3] || "Sin Cargo",
      montoBruto: parseInt(row.cell[4] || "0"),
      aportesPersonales: parseInt(row.cell[5] || "0"),
      contribucionesPatronales: parseInt(row.cell[6] || "0"),
    }));

    await fs.mkdir("data", { recursive: true });
    await fs.writeFile("data/sueldos.json", JSON.stringify(data, null, 2));
    console.log("Datos guardados:", data.length);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fetchAndStoreSueldos();