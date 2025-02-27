"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import sueldosData from "../../data/sueldos.json";
import executionsData from "../../data/executions.json";
import executionDetailsData from "../../data/executionDetails.json";
import { useRouter, useSearchParams } from "next/navigation";

interface SpendingDataItem {
  jurisdiccion: string;
  unidadOrganigrama: string;
  unidadSuperior: string;
  cargo: string;
  montoBruto: number;
  aportesPersonales: number;
  contribucionesPatronales: number;
  year: number;
  month: string;
}

interface ExecutionDataItem {
  obra: string;
  idObra: number | null;
  programa: string;
  jurisdiccion: string;
  objetoGasto: string;
  beneficiario: string;
  monto: number;
  year: number;
}

interface ExecutionDetailItem {
  idObra: number;
  year: number;
  jurisdiccion: string;
  creditoVigente: number;
  devengado: number;
  pagado: number;
}

export default function Gastos() {
  const [spendingData, setSpendingData] = useState<SpendingDataItem[]>([]);
  const [executionData, setExecutionData] = useState<ExecutionDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState("2025");  // New state for temporary year selection
  const [selectedMonth, setSelectedMonth] = useState("01");  // New state for temporary month selection
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("01");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlYear = searchParams.get('year') || '2025';

  useEffect(() => {
    setSelectedYear(urlYear);
    setYear(urlYear);
  }, [urlYear]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDateChange = () => {
    setYear(selectedYear);
    setMonth(selectedMonth);
    router.push(`/gastos?year=${selectedYear}`);
  };

  useEffect(() => {
    setSelectedYear(urlYear);
    setYear(urlYear);
  }, [urlYear]);

  useEffect(() => {
    try {
      const filteredSueldos = Array.isArray(sueldosData)
        ? sueldosData.filter((item) => String(item.year) === year && item.month === month)
        : [];
      setSpendingData(filteredSueldos);

      const filteredExecutions = Array.isArray(executionsData)
        ? executionsData.filter((item) => String(item.year) === year)
        : [];
      const enrichedExecutions = filteredExecutions.map((item) => {
        const details = executionDetailsData.filter(
          (detail) => detail.idObra === item.idObra &&
            String(detail.year) === year
        );

        const totalPagado = details.reduce((sum, detail) => sum + detail.pagado, 0);

        return {
          ...item,
          jurisdiccion: details[0]?.jurisdiccion || item.jurisdiccion,
          monto: totalPagado || item.monto,
        };
      });
      setExecutionData(enrichedExecutions);

      setLoading(false);
    } catch (err) {
      console.error("Error processing data:", err);
      setError("Error al procesar los datos");
      setLoading(false);
    }
  }, [year, month]); // This effect now depends on the confirmed year/month

  const groupedByJurisdiccionSueldos = spendingData.reduce((acc, item) => {
    if (!acc[item.jurisdiccion]) {
      acc[item.jurisdiccion] = { items: [], totalMontoBruto: 0 };
    }
    acc[item.jurisdiccion].items.push(item);
    acc[item.jurisdiccion].totalMontoBruto += item.montoBruto;
    return acc;
  }, {} as Record<string, { items: SpendingDataItem[]; totalMontoBruto: number }>);

  const totalGeneralSueldos = Object.values(groupedByJurisdiccionSueldos).reduce(
    (sum, { totalMontoBruto }) => sum + totalMontoBruto,
    0
  );

  const yearlyPartialTotalSueldos = Array.isArray(sueldosData)
    ? sueldosData
      .filter((item) => String(item.year) === year && item.month <= month)
      .reduce((sum, item) => sum + item.montoBruto, 0)
    : 0;

  const groupedByObraExecutions = executionData.reduce((acc, item) => {
    if (!acc[item.obra]) {
      acc[item.obra] = { items: [], totalMonto: 0, idObra: item.idObra };
    }
    acc[item.obra].items.push(item);
    acc[item.obra].totalMonto += item.monto;
    return acc;
  }, {} as Record<string, { items: ExecutionDataItem[]; totalMonto: number; idObra: number | null }>);

  const totalGeneralExecutions = Object.values(groupedByObraExecutions).reduce(
    (sum, { totalMonto }) => sum + totalMonto,
    0
  );

  const yearlyTotalExecutions = Array.isArray(executionsData)
    ? executionsData
      .filter((item: ExecutionDataItem) => String(item.year) === year)
      .reduce((sum, item: ExecutionDataItem) => sum + item.monto, 0)
    : 0;

  const sortedJurisdiccionesSueldos = Object.entries(groupedByJurisdiccionSueldos).sort((a, b) =>
    sortOrder === "desc"
      ? b[1].totalMontoBruto - a[1].totalMontoBruto
      : a[1].totalMontoBruto - b[1].totalMontoBruto
  );

  const sortedObrasExecutions = Object.entries(groupedByObraExecutions).sort((a, b) =>
    sortOrder === "desc"
      ? b[1].totalMonto - a[1].totalMonto
      : a[1].totalMonto - b[1].totalMonto
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const isYearlyTotalComplete = month === "12";
  const yearlyTotalLabel = isYearlyTotalComplete
    ? `Total Anual (${year})`
    : `Total Anual Parcial (${year} hasta ${month})`;

  if (loading) return <div className="text-center p-6">Cargando datos...</div>;

  if (error) {
    return (
      <div className="text-center text-red-600 p-6">
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-blue-900 dark:text-white">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900 dark:text-white">
          Rastreador de Gastos Provinciales
        </h1>
        <p className="mb-6 text-sm md:text-base text-blue-900 dark:text-white">
          Total de gastos en sueldos y ejecución presupuestaria para {month}/{year}.
        </p>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-end">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <label htmlFor="year" className="mr-2 text-sm md:text-base text-blue-900 dark:text-white">
                Año:
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="p-2 border dark:border-gray-600 rounded w-full sm:w-auto bg-white dark:bg-gray-700 text-blue-900 dark:text-white"
              >
                {Array.from({ length: 3 }, (_, i) => 2023 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label htmlFor="month" className="mr-2 text-sm md:text-base text-blue-900 dark:text-white">
                Mes:
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2 border dark:border-gray-600 rounded w-full sm:w-auto bg-white dark:bg-gray-700 text-blue-900 dark:text-white"
              >
                <option value="01">Enero</option>
                <option value="02">Febrero</option>
                <option value="03">Marzo</option>
                <option value="04">Abril</option>
                <option value="05">Mayo</option>
                <option value="06">Junio</option>
                <option value="07">Julio</option>
                <option value="08">Agosto</option>
                <option value="09">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>
            <button
              onClick={handleDateChange}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Cambiar fecha
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-blue-900 dark:text-white">
              Totales por Jurisdicción (Sueldos)
            </h2>
            <button
              onClick={toggleSortOrder}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Ordenar {sortOrder === "desc" ? "Ascendente" : "Descendente"}
            </button>
          </div>
          {spendingData.length === 0 ? (
            <p className="text-center text-blue-900 dark:text-white">
              No hay datos de sueldos disponibles para este período.
            </p>
          ) : (
            <ul className="space-y-4">
              {sortedJurisdiccionesSueldos.map(([jurisdiccion, { totalMontoBruto }]) => (
                <li
                  key={jurisdiccion}
                  className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                >
                  <Link
                    href={`/gastos/${encodeURIComponent(jurisdiccion)}?year=${year}&month=${month}`}
                    className="font-medium text-blue-900 dark:text-white hover:underline"
                  >
                    {jurisdiccion}
                  </Link>
                  <span className="font-semibold text-blue-900 dark:text-white">
                    ${totalMontoBruto.toLocaleString("es-AR")}
                  </span>
                </li>
              ))}
              <li className="border rounded-lg p-4 bg-blue-100 dark:bg-blue-900 flex justify-between items-center font-bold">
                <span>Total Mensual (Sueldos)</span>
                <span>${totalGeneralSueldos.toLocaleString("es-AR")}</span>
              </li>
              <li className="border rounded-lg p-4 bg-green-100 dark:bg-green-900 flex justify-between items-center font-bold">
                <span>{yearlyTotalLabel} (Sueldos)</span>
                <span>${yearlyPartialTotalSueldos.toLocaleString("es-AR")}</span>
              </li>
            </ul>
          )}
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-blue-900 dark:text-white">
              Totales por Obra (Ejecución Presupuestaria)
            </h2>
          </div>
          {executionData.length === 0 ? (
            <p className="text-center text-blue-900 dark:text-white">
              No hay datos de ejecución presupuestaria disponibles para este año.
            </p>
          ) : (
            <ul className="space-y-4">
              {sortedObrasExecutions.map(([obra, { totalMonto, idObra }]) => (
                <li
                  key={obra}
                  className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                >
                  <Link
                    href={`/gastos/obra/${idObra}?year=${year}`}
                    className="font-medium text-blue-900 dark:text-white hover:underline"
                  >
                    {obra}
                  </Link>
                  <span className="font-semibold text-blue-900 dark:text-white">
                    ${totalMonto.toLocaleString("es-AR")}
                  </span>
                </li>
              ))}
              <li className="border rounded-lg p-4 bg-blue-100 dark:bg-blue-900 flex justify-between items-center font-bold">
                <span>Total Ejecución ({year})</span>
                <span>${totalGeneralExecutions.toLocaleString("es-AR")}</span>
              </li>
              <li className="border rounded-lg p-4 bg-green-100 dark:bg-green-900 flex justify-between items-center font-bold">
                <span>Total Anual ({year})</span>
                <span>${yearlyTotalExecutions.toLocaleString("es-AR")}</span>
              </li>
            </ul>
          )}
        </div>
      </main>
      <Footer />
      
      {/* Add the floating button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18" 
              />
            </svg>
            <span>Ir al principio</span>
          </div>
        </button>
      )}
    </div>
  );
}