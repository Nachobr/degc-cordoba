"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import sueldosData from "../data/sueldos.json";
import executionsData from "../data/executions.json";
import executionDetailsData from "../data/executionDetails.json";

interface SpendingDataItem {
  type: string;
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

interface TweetPost {
  content: string;
  type: "sueldo" | "ejecucion";
  amount: number;
  date: string;
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
            .map(item => ({
              ...item,
              type: "sueldo" // Add the required type property
            }))
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
  }, [sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-blue-900 dark:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
       
        <section className="w-full max-w-4xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Gastos Recientes</h2>
            <a 
              href="https://x.com/DOGEargent" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              aria-label="Twitter/X"
            >
              <span>Seguinos en</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
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
                  className={`border rounded-lg p-4 ${item.type === "sueldo" ? "bg-blue-50 dark:bg-blue-900/30" : "bg-green-50 dark:bg-green-900/30"} hover:bg-opacity-80 dark:hover:bg-opacity-40`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {item.type === "sueldo" ? (
                        <span className="text-xl">📊</span>
                      ) : (
                        <span className="text-xl">💸</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 dark:text-white mb-2">{item.jurisdiccion} - {item.cargo}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{item.month}/{item.year}</span>
                        <span className="font-semibold text-blue-900 dark:text-blue-300">
                          ${item.montoBruto.toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <a href="/gastos" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">
            Ver Gastos
          </a>
          <a href="https://bsaenz.shinyapps.io/pauta-cordoba/" target="_blank" rel="noopener noreferrer" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-center">
            Gasto en Pauta Publicitaria
          </a>
          <a href="/denuncias" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center">
            Reportar Desperdicio
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function handleUserInteraction(this: Document, ev: MouseEvent) {
  throw new Error("Function not implemented.");
}
