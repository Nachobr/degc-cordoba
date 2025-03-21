"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import sueldosData from "../../data/sueldos.json";
import executionsData from "../../data/executions.json";
import executionDetailsData from "../../data/executionDetails.json";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateJurisdiccionTotals } from "../utils/calculateTotals";

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
  const [selectedYear, setSelectedYear] = useState("2025");  
  const [selectedMonth, setSelectedMonth] = useState("01");  
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("01");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showScrollButton, setShowScrollButton] = useState(false);
  // Nuevos estados para la búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  // Estados para datos filtrados
  const [filteredSpendingData, setFilteredSpendingData] = useState<SpendingDataItem[]>([]);
  const [filteredExecutionData, setFilteredExecutionData] = useState<ExecutionDataItem[]>([]);
  const [viewType, setViewType] = useState<'annual' | 'monthly'>('monthly');

  const router = useRouter();
  const searchParams = useSearchParams();

  const urlYear = searchParams.get('year') || '2025';

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

  // Nuevo: manejar el cambio en la búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Nuevo: manejar el cambio en la categoría de búsqueda
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchCategory(e.target.value);
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
      setFilteredSpendingData(filteredSueldos);

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
      setFilteredExecutionData(enrichedExecutions);

      setLoading(false);
    } catch (err) {
      console.error("Error processing data:", err);
      setError("Error al procesar los datos");
      setLoading(false);
    }
  }, [year, month]); // This effect now depends on the confirmed year/month

  // Nuevo: efecto para filtrar datos según el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSpendingData(spendingData);
      setFilteredExecutionData(executionData);
      return;
    }

    const term = searchTerm.toLowerCase();

    // Filtrar datos de sueldos si la categoría es "all" o "sueldos"
    if (searchCategory === "all" || searchCategory === "sueldos") {
      const filtered = spendingData.filter(item =>
        item.jurisdiccion.toLowerCase().includes(term) ||
        item.unidadOrganigrama.toLowerCase().includes(term) ||
        item.cargo.toLowerCase().includes(term)
      );
      setFilteredSpendingData(filtered);
    } else {
      // Si la categoría es "ejecucion", no mostrar resultados de sueldos
      setFilteredSpendingData([]);
    }

    // Filtrar datos de ejecución si la categoría es "all" o "ejecucion"
    if (searchCategory === "all" || searchCategory === "ejecucion") {
      const filtered = executionData.filter(item =>
        item.obra.toLowerCase().includes(term) ||
        item.programa.toLowerCase().includes(term) ||
        item.jurisdiccion.toLowerCase().includes(term) ||
        item.beneficiario.toLowerCase().includes(term)
      );
      setFilteredExecutionData(filtered);
    } else {
      // Si la categoría es "sueldos", no mostrar resultados de ejecución
      setFilteredExecutionData([]);
    }
  }, [searchTerm, searchCategory, spendingData, executionData]);

  const groupedByJurisdiccionSueldos = filteredSpendingData.reduce((acc, item) => {
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

  const groupedByObraExecutions = filteredExecutionData.reduce((acc, item) => {
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

  const sortedJurisdiccionesSueldos = Object.entries(groupedByJurisdiccionSueldos).sort((a, b) => {
    const totalsA = calculateJurisdiccionTotals(
      a[0],
      year,
      viewType === 'monthly' ? month : undefined
    );
    
    const totalsB = calculateJurisdiccionTotals(
      b[0],
      year,
      viewType === 'monthly' ? month : undefined
    );
    
    return sortOrder === "desc"
      ? totalsB.total - totalsA.total
      : totalsA.total - totalsB.total;
  });
/*
  const sortedObrasExecutions = Object.entries(groupedByObraExecutions).sort((a, b) =>
    sortOrder === "desc"
      ? b[1].totalMonto - a[1].totalMonto
      : a[1].totalMonto - b[1].totalMonto
  );
*/
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

        <div className="mb-6 flex flex-col gap-4">
          {/* View selection control */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setViewType('annual');
                }}
                className={`px-4 py-2 rounded-l-lg ${viewType === 'annual'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800'
                  }`}
              >
                Vista Anual
              </button>
              <button
                onClick={() => setViewType('monthly')}
                className={`px-4 py-2 rounded-r-lg ${viewType === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800'
                  }`}
              >
                Vista Mensual
              </button>
            </div>
          </div>

          {/* Search bar - add this section */}
          <div className="flex items-center gap-2 max-w-md mx-auto w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-2 pl-3 pr-10 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-blue-900 dark:text-white"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              value={searchCategory}
              onChange={handleCategoryChange}
              className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-blue-900 dark:text-white"
            >
              <option value="all">Todos</option>
              <option value="sueldos">Sueldos</option>
              <option value="ejecucion">Ejecución</option>
            </select>
          </div>

          {/* Conditional date controls */}
          {viewType === 'monthly' ? (
            <div className="flex flex-wrap items-center gap-4 justify-center">
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
          ) : (
            <div className="flex items-center justify-center">
              <label htmlFor="year" className="mr-2 text-sm md:text-base text-blue-900 dark:text-white">
                Año:
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setYear(e.target.value);
                  router.push(`/gastos?year=${e.target.value}`);
                }}
                className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-blue-900 dark:text-white"
              >
                {Array.from({ length: 3 }, (_, i) => 2023 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* In the data display section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-semibold">
              {viewType === 'annual'
                ? `Totales Anuales por Jurisdicción (${year})`
                : `Totales Mensuales por Jurisdicción (${month}/${year})`
              }
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total General</div>
                <div className="font-semibold text-lg">
                  ${sortedJurisdiccionesSueldos.reduce((acc, [jurisdiccion]) => {
                    const totals = calculateJurisdiccionTotals(
                      jurisdiccion,
                      year,
                      viewType === 'monthly' ? month : undefined
                    );
                    return acc + totals.total;
                  }, 0).toLocaleString("es-AR")}
                </div>
              </div>
              <button
                onClick={toggleSortOrder}
                className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
              >
                {sortOrder === "desc" ? "Mayor a menor" : "Menor a mayor"}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {sortOrder === "desc" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <ul className="space-y-4">
            {sortedJurisdiccionesSueldos.map(([jurisdiccion]) => (
              <li key={jurisdiccion} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/gastos/${encodeURIComponent(jurisdiccion)}?year=${year}${viewType === 'monthly' ? `&month=${month}` : ''}`}
                      className="font-medium hover:underline"
                    >
                      {jurisdiccion}
                    </Link>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${(() => {
                        const totals = calculateJurisdiccionTotals(
                          jurisdiccion,
                          year,
                          viewType === 'monthly' ? month : undefined
                        );
                        return totals.total.toLocaleString("es-AR");
                      })()}
                    </div>
                    {viewType === 'annual' && (
                      <div className="text-sm text-gray-500">
                        Total anual
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
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