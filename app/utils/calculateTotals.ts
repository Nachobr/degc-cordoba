import sueldosData from "../../data/sueldos.json";
import executionDetailsData from "../../data/executionDetails.json";

interface TotalCalculationResult {
  sueldos: number;
  ejecuciones: number;
  total: number;
}

export function calculateJurisdiccionTotals(
  jurisdiccion: string,
  year: string,
  month?: string
): TotalCalculationResult {
  // Normalize the jurisdiction name for comparison
  const normalizedJurisdiccion = decodeURIComponent(jurisdiccion).toLowerCase();

  // Calculate sueldos total with normalized comparison
  const sueldosTotal = Array.isArray(sueldosData)
    ? sueldosData
        .filter((item) => {
          const yearMatch = String(item.year) === year;
          const jurisdiccionMatch = item.jurisdiccion.toLowerCase() === normalizedJurisdiccion;
          
          return month 
            ? yearMatch && jurisdiccionMatch && item.month === month
            : yearMatch && jurisdiccionMatch;
        })
        .reduce((sum, item) => sum + item.montoBruto, 0)
    : 0;

  // Filter execution details that match the jurisdiction using includes for partial matches
  const matchingDetails = executionDetailsData.filter(detail =>
    detail.jurisdiccion.toLowerCase().includes(normalizedJurisdiccion) &&
    String(detail.year) === year
  );

  // Calculate ejecuciones total directly from matching details
  const ejecucionesTotal = matchingDetails.reduce((sum, detail) => sum + detail.pagado, 0);

  return {
    sueldos: sueldosTotal,
    ejecuciones: ejecucionesTotal,
    total: sueldosTotal + ejecucionesTotal
  };
}