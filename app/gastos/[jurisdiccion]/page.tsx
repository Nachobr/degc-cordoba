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
  const [spendingData, setSpendingData] = useState<SpendingDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // Estado para ordenamiento
  const router = useRouter();
  const { jurisdiccion } = params;

  const [year, setYear] = useState("2024");
  const [month, setMonth] = useState("02");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setYear(searchParams.get("year") || "2024");
      setMonth(searchParams.get("month") || "02");
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
    <div className="min-h-screen flex flex-col bg-white text-blue-900">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Detalle de Gastos: {decodeURIComponent(jurisdiccion)}
        </h1>
        <p className="mb-6 text-sm md:text-base">
          Desglose de sueldos para {month}/{year}.
        </p>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push(`/gastos?year=${year}&month=${month}`)}
            className="text-blue-500 hover:underline"
          >
            ← Volver a Totales
          </button>
          <button
            onClick={toggleSortOrder}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Ordenar {sortOrder === "desc" ? "Ascendente" : "Descendente"}
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-2 border text-left">Unidad</th>
                  <th className="p-2 border text-left hidden md:table-cell">Unidad Superior</th>
                  <th className="p-2 border text-left">Cargo</th>
                  <th className="p-2 border text-right">Monto Bruto</th>
                  <th className="p-2 border text-right hidden md:table-cell">Aportes Personales</th>
                  <th className="p-2 border text-right hidden md:table-cell">Contribuciones Patronales</th>
                </tr>
              </thead>
              <tbody>
                {spendingData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border">{item.unidadOrganigrama}</td>
                    <td className="p-2 border hidden md:table-cell">{item.unidadSuperior}</td>
                    <td className="p-2 border">{item.cargo}</td>
                    <td className="p-2 border text-right">${item.montoBruto.toLocaleString("es-AR")}</td>
                    <td className="p-2 border text-right hidden md:table-cell">
                      ${item.aportesPersonales.toLocaleString("es-AR")}
                    </td>
                    <td className="p-2 border text-right hidden md:table-cell">
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
    </div>
  );
}