import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { promises as fs } from "fs";

async function fetchAndStoreSueldos() {
  const startYear = 2023;
  const startMonth = 1; // Enero 2024
  const endYear = 2025;
  const endMonth = 2; // Enero 2025
  const maxAttempts = 3;
  let allData = [];

  // Iterate over months from January 2024 to January 2025
  for (let year = startYear; year <= endYear; year++) {
    const monthLimit = year === endYear ? endMonth : 12; // Stop at January 2025
    for (let month = year === startYear ? startMonth : 1; month <= monthLimit; month++) {
      const formattedMonth = String(month).padStart(2, "0");
      const url = `https://transparencia.cba.gov.ar/HandlerSueldos.ashx?anio=${year}&mes=${formattedMonth}&rows=2000&page=1&sidx=invdate&sord=desc`;
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Attempt ${attempts} to fetch data for ${year}-${formattedMonth}...`);
          console.log(`Fetching data from URL: ${url}`);

          // Use axios with a timeout of 90 seconds
          const response = await axios.get(url, {
            headers: {
              "Accept": "application/xml",
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            },
            timeout: 90000, // Built-in timeout support
          });

          console.log(`Response received. Status: ${response.status}`);
          console.log(`Response headers:`, response.headers);

          if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const xmlText = response.data;
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
            year: year, // Añadir año para referencia
            month: formattedMonth, // Añadir mes para referencia
          }));
          allData = allData.concat(data); // Acumular datos de cada mes
          console.log(`Fetched ${data.length} records for ${year}-${formattedMonth}`);
          break; // Success, exit the retry loop
        } catch (error) {
          console.error(`Attempt ${attempts} failed for ${year}-${formattedMonth}:`, error.message || error);

          if (axios.isAxiosError(error)) {
            if (error.response) {
              console.error(`HTTP error! Status: ${error.response.status}, Body: ${error.response.data}`);
            } else if (error.request) {
              console.error("No response received from server.");
            } else {
              console.error("Error setting up the request:", error.message);
            }
          }

          if (attempts === maxAttempts) {
            console.error(`Max attempts reached for ${year}-${formattedMonth}, skipping...`);
            break; // Move to the next month
          }

          const waitTime = Math.pow(2, attempts) * 1000;
          console.log(`Waiting ${waitTime / 1000} seconds before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }
  }

  // Save all accumulated data to file
  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/sueldos.json", JSON.stringify(allData, null, 2));
  console.log("Datos totales guardados:", allData.length);
}

process.on("SIGTERM", () => {
  console.log("Job canceled. Cleaning up...");
  process.exit(0);
});

fetchAndStoreSueldos();