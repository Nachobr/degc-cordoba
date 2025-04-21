import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { promises as fs } from "fs";
import executionsData from "../data/executions.json" assert { type: "json" }; // Aserción añadida

async function fetchAndStoreExecutionDetails() {
  const maxAttempts = 3;
  const rowsPerPage = 3000;
  let allDetails = [];

  // Usar los idObra y años de executions.json
  const obraEntries = executionsData.map((item) => ({
    idObra: item.idObra,
    year: item.year,
  }));

  for (const { idObra, year } of obraEntries) {
    if (!idObra) continue; // Saltar si no hay idObra
    const codedYear = 206 + (year - 2023); // 206 = 2023, 207 = 2024, 208 = 2025
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      const url = `https://transparencia.cba.gov.ar/HandlerMasterConsulta.ashx?idObra=${idObra}&idVigenciaObra=${codedYear}&_search=false&rows=${rowsPerPage}&page=${page}&sidx=invdate&sord=desc`;
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Attempt ${attempts} to fetch details for idObra ${idObra}, year ${year} (coded as ${codedYear}), page ${page}...`);
          console.log(`Fetching data from URL: ${url}`);

          const response = await axios.get(url, {
            headers: {
              "Accept": "application/xml",
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
            },
            timeout: 90000,
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
            idObra: idObra,
            year: year,
            jurisdiccion: row.cell[1] || "Sin Jurisdicción",
            creditoVigente: parseFloat(row.cell[2] || "0"),
            devengado: parseFloat(row.cell[3] || "0"),
            pagado: parseFloat(row.cell[4] || "0"),
          }));

          allDetails = allDetails.concat(data);
          console.log(`Fetched ${data.length} records for idObra ${idObra}, year ${year}, page ${page}`);

          hasMoreData = data.length === rowsPerPage;
          page++;
          break;
        } catch (error) {
          console.error(`Attempt ${attempts} failed for idObra ${idObra}, year ${year}, page ${page}:`, error.message || error);

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
            console.error(`Max attempts reached for idObra ${idObra}, year ${year}, page ${page}, skipping...`);
            hasMoreData = false;
            break;
          }

          const waitTime = Math.pow(2, attempts) * 1000;
          console.log(`Waiting ${waitTime / 1000} seconds before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }
  }

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/executionDetails.json", JSON.stringify(allDetails, null, 2));
  console.log("Datos totales guardados:", allDetails.length);
}

process.on("SIGTERM", () => {
  console.log("Job canceled. Cleaning up...");
  process.exit(0);
});

fetchAndStoreExecutionDetails();

