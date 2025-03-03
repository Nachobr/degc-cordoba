"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import sueldosData from "../../../data/sueldos.json";

import executionsData from "../../../data/executions.json";
import executionDetailsData from "../../../data/executionDetails.json";

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



// Add interfaces for execution data
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

function removeDuplicates(data: (ExecutionDataItem & { pagado?: number })[]) {
  const uniqueData = new Map<string, ExecutionDataItem & { pagado?: number }>();

  data.forEach(item => {
    const key = `${item.obra}-${item.programa}-${item.pagado}`;
    if (uniqueData.has(key)) {
      const existingItem = uniqueData.get(key);
      if (existingItem) {
        existingItem.jurisdiccion += " (both)";
      }
    } else {
      uniqueData.set(key, { ...item });
    }
  });

  return Array.from(uniqueData.values());
}

export default function JurisdiccionDetail({ params }: { params: { jurisdiccion: string } }) {
  // Add this with other state declarations at the top
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add this with other useEffect hooks
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

  const [spendingData, setSpendingData] = useState<SpendingDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("asc"); // Estado para ordenamiento
  const router = useRouter();
  const { jurisdiccion } = params;

  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("01");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setYear(searchParams.get("year") || "2025");
      setMonth(searchParams.get("month") || "01");
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'sueldos' | 'ejecuciones'>('sueldos');
  const [executionData, setExecutionData] = useState<(ExecutionDataItem & { pagado?: number })[]>([]);
  const [totalSueldos, setTotalSueldos] = useState(0);
  const [totalEjecuciones, setTotalEjecuciones] = useState(0);

  // Replace the existing useEffect with this updated version
  // Update the useEffect that processes data
  useEffect(() => {
    try {
      // Process salary data
      const filteredSueldos = Array.isArray(sueldosData)
        ? sueldosData
          .filter(
            (item) =>
              item.jurisdiccion === decodeURIComponent(jurisdiccion) &&
              String(item.year) === year &&
              item.month === month
          )
          .sort((a, b) =>
            sortOrder === "asc" ? b.montoBruto - a.montoBruto : a.montoBruto - b.montoBruto
          )
        : [];
      setSpendingData(filteredSueldos);
      setTotalSueldos(filteredSueldos.reduce((sum, item) => sum + item.montoBruto, 0));

      // Process execution data with details
      // First, normalize the jurisdiction name for comparison
      const normalizedJurisdiccion = decodeURIComponent(jurisdiccion).toLowerCase();

      // Filter execution details that match the jurisdiction (using includes for partial matches)
      const matchingDetails = executionDetailsData.filter(detail =>
        detail.jurisdiccion.toLowerCase().includes(normalizedJurisdiccion) &&
        String(detail.year) === year
      );

      // Create a map of execution details by ID for faster lookup
      const detailsMap = new Map(
        matchingDetails.map(detail => [detail.idObra, detail])
      );

      // Filter and map executions that have matching details
      const filteredExecutions = executionsData
        .filter(execution => {
          const detail = detailsMap.get(execution.idObra || 0);
          return detail && String(detail.year) === year;
        })
        .map(execution => ({
          ...execution,
          pagado: detailsMap.get(execution.idObra || 0)?.pagado || 0
        }))
        .sort((a, b) =>
          sortOrder === "asc" ? (b.pagado || 0) - (a.pagado || 0) : (a.pagado || 0) - (b.pagado || 0)
        );

      // Remove duplicates
      const uniqueExecutions = removeDuplicates(filteredExecutions);
      setExecutionData(uniqueExecutions);

      // Calculate total executions from the matching details directly
      const totalPagado = matchingDetails.reduce((sum, item) => sum + item.pagado, 0);
      setTotalEjecuciones(totalPagado);

      if (filteredSueldos.length === 0 && matchingDetails.length === 0) {
        setError(`No se encontraron datos para ${decodeURIComponent(jurisdiccion)} en ${month}/${year}`);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error processing data:", err);
      setError("Error al procesar los datos");
      setLoading(false);
    }
  }, [jurisdiccion, year, month, sortOrder]);
  // Replace the throwing error function with this implementation
  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    setSearchTerm(event.target.value);
  }


  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-blue-900 dark:text-white">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900 dark:text-white">
          Detalle de Gastos: {decodeURIComponent(jurisdiccion)}
        </h1>
        <p className="mb-6 text-sm md:text-base text-blue-900 dark:text-white">
          Desglose de gastos para {month}/{year}
        </p>

        {/* Total amounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Sueldos</h3>
            <p className="text-2xl">${totalSueldos.toLocaleString('es-AR')}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Ejecuciones</h3>
            <p className="text-2xl">${totalEjecuciones.toLocaleString('es-AR')}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total General</h3>
            <p className="text-2xl">${(totalSueldos + totalEjecuciones).toLocaleString('es-AR')}</p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('sueldos')}
            className={`px-4 py-2 rounded ${activeTab === 'sueldos'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
              }`}
          >
            Sueldos
          </button>
          <button
            onClick={() => setActiveTab('ejecuciones')}
            className={`px-4 py-2 rounded ${activeTab === 'ejecuciones'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
              }`}
          >
            Ejecuciones Presupuestarias
          </button>
        </div>

        {/* Back button and sort order */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push(`/gastos?year=${year}&month=${month}`)}
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            ← Volver a Totales
          </button>
          <button
            onClick={toggleSortOrder}
            className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
          >
            {sortOrder === "asc" ? "Mayor a menor" : "Menor a mayor"}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {sortOrder === "desc" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              )}
            </svg>
          </button>
        </div>

        {activeTab === 'sueldos' && (
          <>
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por unidad, cargo..."
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
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-100 dark:bg-blue-900">
                    <th className="p-2 border dark:border-gray-600 text-left">Unidad</th>
                    <th className="p-2 border dark:border-gray-600 text-left hidden md:table-cell">Unidad Superior</th>
                    <th className="p-2 border dark:border-gray-600 text-left">Cargo</th>
                    <th className="p-2 border dark:border-gray-600 text-right">Monto Bruto</th>
                    <th className="p-2 border dark:border-gray-600 text-right hidden md:table-cell">Aportes Personales</th>
                    <th className="p-2 border dark:border-gray-600 text-right hidden md:table-cell">Contribuciones Patronales</th>
                  </tr>
                </thead>
                <tbody>
                  {spendingData
                    .filter(item =>
                      item.unidadOrganigrama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.unidadSuperior.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.cargo.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 border dark:border-gray-600">{item.unidadOrganigrama}</td>
                        <td className="p-2 border dark:border-gray-600 hidden md:table-cell">{item.unidadSuperior}</td>
                        <td className="p-2 border dark:border-gray-600">{item.cargo}</td>
                        <td className="p-2 border dark:border-gray-600 text-right">${item.montoBruto.toLocaleString("es-AR")}</td>
                        <td className="p-2 border dark:border-gray-600 text-right hidden md:table-cell">
                          ${item.aportesPersonales.toLocaleString("es-AR")}
                        </td>
                        <td className="p-2 border dark:border-gray-600 text-right hidden md:table-cell">
                          ${item.contribucionesPatronales.toLocaleString("es-AR")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'ejecuciones' && (
          <>
            {/* Add search input for ejecuciones */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por obra, programa..."
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
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-100 dark:bg-blue-900">
                    <th className="p-2 border dark:border-gray-600 text-left">Obra</th>
                    <th className="p-2 border dark:border-gray-600 text-left">Programa</th>
                    <th className="p-2 border dark:border-gray-600 text-right">Monto Pagado</th>
                  </tr>
                </thead>
                <tbody>
                  {executionData
                    .filter(item =>
                      item.obra.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.programa.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 border dark:border-gray-600">{item.obra}</td>
                        <td className="p-2 border dark:border-gray-600">{item.programa}</td>
                        <td className="p-2 border dark:border-gray-600 text-right">
                          ${item.pagado?.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
      <Footer />

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



