"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import executionDetailsData from "../../../../data/executionDetails.json";

interface ExecutionDetailItem {
  idObra: number;
  year: number;
  jurisdiccion: string;
  creditoVigente: number;
  devengado: number;
  pagado: number;
}

import { useRouter, useSearchParams } from "next/navigation";

export default function ObraDetail({ params }: { params: { idObra: string } }) {
  const [executionData, setExecutionData] = useState<ExecutionDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { idObra } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || '2024';

  useEffect(() => {
    try {
      const filteredData = Array.isArray(executionDetailsData)
        ? executionDetailsData.filter((item) => 
            String(item.idObra) === idObra && 
            String(item.year) === year
          )
        : [];
      setExecutionData(filteredData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing data:", err);
      setError("Error al procesar los datos");
      setLoading(false);
    }
  }, [idObra, year]);

  if (loading) return <div className="text-center p-6">Cargando datos...</div>;
  if (error) return <div className="text-center text-red-600 p-6">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-blue-900 dark:text-white">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Desglose de Obra: {executionData[0]?.idObra}
        </h1>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push(`/gastos?year=${year}`)}
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            ← Volver a Totales
          </button>
        </div>

        <ul className="space-y-4">
          {executionData.map((item, index) => (
            <li key={index} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <p>Jurisdicción: {item.jurisdiccion}</p>
              <p>Crédito Vigente: ${item.creditoVigente.toLocaleString("es-AR")}</p>
              <p>Devengado: ${item.devengado.toLocaleString("es-AR")}</p>
              <p>Pagado: ${item.pagado.toLocaleString("es-AR")}</p>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}