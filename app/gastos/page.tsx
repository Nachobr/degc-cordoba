"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import sueldosData from "../../data/sueldos.json";

interface SpendingDataItem {
  jurisdiccion: string;
  unidadOrganigrama: string;
  unidadSuperior: string;
  cargo: string;
  montoBruto: number;
  aportesPersonales: number;
  contribucionesPatronales: number;
  year: number; // Permitir ambos tipos
  month: string;
}

export default function Gastos() {
  const [spendingData, setSpendingData] = useState<SpendingDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("01");

  useEffect(() => {
    try {
      const filteredData = Array.isArray(sueldosData)
        ? sueldosData.filter((item) => String(item.year) === year && item.month === month)
        : [];
      setSpendingData(filteredData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing spending data:", err);
      setError("Error al procesar los datos");
      setLoading(false);
    }
  }, [year, month]);

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

  const groupedByJurisdiccion = spendingData.reduce((acc, item) => {
    if (!acc[item.jurisdiccion]) {
      acc[item.jurisdiccion] = { items: [], totalMontoBruto: 0 };
    }
    acc[item.jurisdiccion].items.push(item);
    acc[item.jurisdiccion].totalMontoBruto += item.montoBruto;
    return acc;
  }, {} as Record<string, { items: SpendingDataItem[]; totalMontoBruto: number }>);

  const totalGeneral = Object.values(groupedByJurisdiccion).reduce(
    (sum, { totalMontoBruto }) => sum + totalMontoBruto,
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-blue-900">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Rastreador de Gastos Provinciales</h1>
        <p className="mb-6 text-sm md:text-base">
          Total de gastos en sueldos por jurisdicción para {month}/{year}. Haz clic en una jurisdicción para ver el desglose.
        </p>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex items-center">
            <label htmlFor="year" className="mr-2 text-sm md:text-base">Año:</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="p-2 border rounded w-full sm:w-auto"
            >
              {Array.from({ length: 2 }, (_, i) => 2024 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <label htmlFor="month" className="mr-2 text-sm md:text-base">Mes:</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="p-2 border rounded w-full sm:w-auto"
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
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Totales por Jurisdicción</h2>
          {spendingData.length === 0 ? (
            <p className="text-center">No hay datos disponibles para este período.</p>
          ) : (
            <ul className="space-y-4">
              {Object.entries(groupedByJurisdiccion).map(([jurisdiccion, { totalMontoBruto }]) => (
                <li
                  key={jurisdiccion}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                >
                  <Link
                    href={`/gastos/${encodeURIComponent(jurisdiccion)}?year=${year}&month=${month}`}
                    className="font-medium hover:underline"
                  >
                    {jurisdiccion}
                  </Link>
                  <span className="font-semibold">${totalMontoBruto.toLocaleString("es-AR")}</span>
                </li>
              ))}
              <li className="border rounded-lg p-4 bg-blue-100 flex justify-between items-center font-bold">
                <span>Total Gastado</span>
                <span>${totalGeneral.toLocaleString("es-AR")}</span>
              </li>
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}