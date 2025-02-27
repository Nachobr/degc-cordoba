import axios from "axios";
import { promises as fs } from "fs";

async function fetchAndStoreExecutions() {
  const startYear = 2023;
  const endYear = 2025;
  const maxAttempts = 3;
  const rowsPerPage = 2000;
  let allData = [];

  for (let year = startYear; year <= endYear; year++) {
    const codedYear = 200 + (year - 2023) + 6; // 206 = 2023, 207 = 2024, 208 = 2025
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      const url = `https://transparencia.cba.gov.ar/HandlerMasterConsulta.ashx?anio=${codedYear}&Obras=Obras&_search=false&rows=${rowsPerPage}&page=${page}&sidx=invdate&sord=desc`;
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Attempt ${attempts} to fetch data for ${year} (coded as ${codedYear}), page ${page}...`);
          console.log(`Fetching data from URL: ${url}`);

          const response = await axios.get(url, {
            headers: {
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
            },
            timeout: 90000,
          });

          console.log(`Response received. Status: ${response.status}`);
          console.log(`Response headers:`, response.headers);

          if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const jsonData = response.data;
          if (!jsonData || !Array.isArray(jsonData)) {
            throw new Error("Received empty or invalid response from server");
          }

          const data = jsonData.map((item) => ({
            obra: item.nobras || "Sin Obra",
            idObra: item.id_Obra || null,
            programa: item.prog || "Sin Programa",
            jurisdiccion: item.nro_nombre_jurisdiccion || "Sin Jurisdicción",
            objetoGasto: item.numero_objeto || "Sin Objeto",
            beneficiario: item.beneficiario || "Sin Beneficiario",
            monto: parseFloat(item.monto || "0"), // Ajustar si aparece en otras filas
            year: year,
          }));

          allData = allData.concat(data);
          console.log(`Fetched ${data.length} records for ${year}, page ${page}`);

          hasMoreData = data.length === rowsPerPage;
          page++;
          break;
        } catch (error) {
          console.error(`Attempt ${attempts} failed for ${year}, page ${page}:`, error.message || error);

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
            console.error(`Max attempts reached for ${year}, page ${page}, skipping...`);
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
  await fs.writeFile("data/executions.json", JSON.stringify(allData, null, 2));
  console.log("Datos totales guardados:", allData.length);
}

process.on("SIGTERM", () => {
  console.log("Job canceled. Cleaning up...");
  process.exit(0);
});

fetchAndStoreExecutions();