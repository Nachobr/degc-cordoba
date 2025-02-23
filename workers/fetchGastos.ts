import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fetchMonthlyData(year: number, month: number) {
  const formattedMonth = month.toString().padStart(2, '0');
  const url = `https://transparencia.cba.gov.ar/HandlerSueldos.ashx?anio=${year}&mes=${formattedMonth}&rows=1000&page=1&sidx=invdate&sord=desc`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/xml',
      'Content-Type': 'application/xml',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  });

  const xmlText = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true
  });

  const jsonData = parser.parse(xmlText);
  return jsonData.rows?.row || [];
}

// Add export keyword here
export async function updateGastosData() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const data: Record<string, Record<string, any[]>> = {};
  
  try {
    // Fetch last 3 months of data
    for (let month = currentMonth; month > currentMonth - 3; month--) {
      const year = month <= 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = month <= 0 ? month + 12 : month;
      
      const monthlyData = await fetchMonthlyData(year, adjustedMonth);
      
      if (!data[year]) data[year] = {};
      data[year][adjustedMonth.toString().padStart(2, '0')] = monthlyData;
    }

    const dataPath = path.join(process.cwd(), 'public', 'data');
    await fs.mkdir(dataPath, { recursive: true });
    await fs.writeFile(
      path.join(dataPath, 'gastos.json'),
      JSON.stringify(data, null, 2)
    );

    console.log('Data updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
}

// Remove the immediate execution since it will be called by the cron job
// updateGastosData();
// setInterval(updateGastosData, 6 * 60 * 60 * 1000);