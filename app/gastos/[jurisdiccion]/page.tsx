"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import sueldosData from "../../../data/sueldos.json";

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

export default function JurisdiccionDetail({ params }: { params: { jurisdiccion: string } }) {
  // Add this with other state declarations at the top
  const [showScrollButton, setShowScrollButton] = useState(false);
  
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
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // Estado para ordenamiento
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

  useEffect(() => {
    try {
      const filteredData = Array.isArray(sueldosData)
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
      if (filteredData.length === 0) {
        setError(`No se encontraron datos para ${decodeURIComponent(jurisdiccion)} en ${month}/${year}`);
      }
      setSpendingData(filteredData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing spending data:", err);
      setError("Error al procesar los datos");
      setLoading(false);
    }
  }, [jurisdiccion, year, month, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-blue-900">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">Cargando datos...</div>
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-blue-900">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Error al cargar los datos
            </h1>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push(`/gastos?year=${year}&month=${month}`)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              ← Volver a Totales
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-blue-900 dark:text-white">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900 dark:text-white">
          Detalle de Gastos: {decodeURIComponent(jurisdiccion)}
        </h1>
        <p className="mb-6 text-sm md:text-base text-blue-900 dark:text-white">
          Desglose de sueldos para {month}/{year}.
        </p>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push(`/gastos?year=${year}&month=${month}`)}
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            ← Volver a Totales
          </button>
          <button
            onClick={toggleSortOrder}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm"
          >
            Ordenar {sortOrder === "desc" ? "Ascendente" : "Descendente"}
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
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
                {spendingData.map((item, index) => (
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