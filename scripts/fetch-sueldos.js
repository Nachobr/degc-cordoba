import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";
import { promises as fs } from "fs";

async function fetchAndStoreSueldos() {
  const year = process.env.YEAR || "2025";
  const month = process.env.MONTH || "01";
  const formattedMonth = month.padStart(2, "0");
  const url = `https://cors-anywhere.herokuapp.com/https://transparencia.cba.gov.ar/HandlerSueldos.ashx?anio=${year}&mes=${formattedMonth}&rows=10&page=1&sidx=invdate&sord=desc`;
  let attempts = 0;
  const maxAttempts = 3;

  // Global timeout wrapper
  const withTimeout = (promise, timeoutMs) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
      ),
    ]);
  };

  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`Attempt ${attempts} to fetch data...`);

      // Fetch data with a global timeout of 60 seconds
      const fetchPromise = fetch(url, {
        headers: {
          "Accept": "application/xml",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
        timeout: 30000, // 30 seconds for the HTTP request itself
      });

      const response = await withTimeout(fetchPromise, 60000); // Enforce a global timeout of 60 seconds

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Response received. Status: ${response.status}`);
      const xmlText = await response.text();

      if (!xmlText || xmlText.trim().length === 0) {
        throw new Error("Received empty response from server");
      }

      // Parse XML into JSON
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

      // Save data to file
      await fs.mkdir("data", { recursive: true });
      await fs.writeFile("data/sueldos.json", JSON.stringify(data, null, 2));
      console.log("Datos guardados:", data.length);
      return; // Success, exit the loop
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error.message || error);

      if (attempts === maxAttempts) {
        console.error("Max attempts reached, failing...");
        process.exit(1);
      }

      // Exponential backoff for retries
      const waitTime = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
      console.log(`Waiting ${waitTime / 1000} seconds before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

// Handle job cancellation gracefully
process.on("SIGTERM", () => {
  console.log("Job canceled. Cleaning up...");
  process.exit(0);
});

fetchAndStoreSueldos();