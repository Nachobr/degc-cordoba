"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import sueldosData from "../data/sueldos.json"; 

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

export default function Home() {
  const [recentSpending, setRecentSpending] = useState<SpendingDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // Estado para ordenamiento

  useEffect(() => {
    try {
      const sortedData = Array.isArray(sueldosData)
        ? [...sueldosData]
            .sort((a, b) =>
              sortOrder === "asc"
                ? b.montoBruto - a.montoBruto
                : a.montoBruto - b.montoBruto
            )
            .slice(0, 10)
        : [];
      setRecentSpending(sortedData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing spending data:", err);
      setError("Error al procesar los datos");
      setLoading(false);
    }
  }, [sortOrder]); // Dependencia en sortOrder para reordenar al cambiar

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-blue-900 dark:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-4 text-center text-blue-900 dark:text-white">
          Departamento de Eficiencia Gubernamental de Córdoba
        </h1>
        <p className="text-lg text-center mb-6 text-blue-900 dark:text-white">
          ¡Seguí el Gasto de Córdoba en Tiempo Real! Reduzcamos el desperdicio, aumentemos la eficiencia.
        </p>

        <section className="w-full max-w-4xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Gastos Recientes en Sueldos</h2>
            <button
              onClick={toggleSortOrder}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Ordenar {sortOrder === "desc" ? "Ascendente" : "Descendente"}
            </button>
          </div>
          {loading ? (
            <p className="text-center text-blue-900 dark:text-white">Cargando datos...</p>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400">
              <p>{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                onClick={() => window.location.reload()}
              >
                Intentar de nuevo
              </button>
            </div>
          ) : recentSpending.length === 0 ? (
            <p className="text-center text-blue-900 dark:text-white">No hay datos disponibles.</p>
          ) : (
            <ul className="space-y-4">
              {recentSpending.map((item, index) => (
                <li
                  key={index}
                  className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.jurisdiccion}</p>
                    <p className="text-sm text-gray-600">{item.cargo}</p>
                    <p className="text-xs text-gray-500">{item.unidadOrganigrama}</p>
                    <p className="text-xs text-gray-500">
                      {item.month}/{item.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-900 dark:text-white">
                      ${item.montoBruto.toLocaleString("es-AR")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monto Bruto</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-x-4">
          <a href="/gastos" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Ver Gastos
          </a>
          <a href="/denuncias" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Reportar Desperdicio
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}