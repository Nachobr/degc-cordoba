"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import sueldosData from "../data/sueldos.json";
import executionsData from "../data/executions.json";
import executionDetailsData from "../data/executionDetails.json";
import Link from "next/link";

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
  idObra: number ;
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

interface TweetPost {
  content: string;
  type: "sueldo" | "ejecucion";
  amount: number;
  date: string;
}

interface JurisdiccionTotal {
  jurisdiccion: string;
  totalSueldos: number;
  totalEjecuciones: number;
  totalGeneral: number;
  sueldosCount: number;
  ejecucionesCount: number;
}

export default function Home() {
  const [jurisdiccionTotals, setJurisdiccionTotals] = useState<JurisdiccionTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    try {
      // Process sueldos data
      const sueldosMap = new Map<string, { total: number, count: number }>();
      
      if (Array.isArray(sueldosData)) {
        sueldosData.forEach(item => {
          const jurisdiccion = item.jurisdiccion;
          if (!sueldosMap.has(jurisdiccion)) {
            sueldosMap.set(jurisdiccion, { total: 0, count: 0 });
          }
          const current = sueldosMap.get(jurisdiccion)!;
          current.total += item.montoBruto;
          current.count += 1;
          sueldosMap.set(jurisdiccion, current);
        });
      }
      
      // Process execution data with details
      const executionMap = new Map<string, { total: number, count: number }>();
      
      if (Array.isArray(executionsData) && Array.isArray(executionDetailsData)) {
        // Create a map of execution details by idObra for faster lookup
        const detailsMap = new Map();
        executionDetailsData.forEach(detail => {
          detailsMap.set((detail as ExecutionDetailItem).idObra, detail);
        });
        
        executionsData.forEach(item => {
          const detail = detailsMap.get(item.idObra);
          if (detail) {
            const jurisdiccion = detail.jurisdiccion;
            if (!executionMap.has(jurisdiccion)) {
              executionMap.set(jurisdiccion, { total: 0, count: 0 });
            }
            const current = executionMap.get(jurisdiccion)!;
            current.total += detail.pagado || 0;
            current.count += 1;
            executionMap.set(jurisdiccion, current);
          }
        });
      }
      
      // Combine data for all jurisdictions
      const allJurisdicciones = new Set([
        ...sueldosMap.keys(),
        ...executionMap.keys()
      ]);
      
      const combinedData: JurisdiccionTotal[] = Array.from(allJurisdicciones).map(jurisdiccion => {
        const sueldosData = sueldosMap.get(jurisdiccion) || { total: 0, count: 0 };
        const executionData = executionMap.get(jurisdiccion) || { total: 0, count: 0 };
        
        return {
          jurisdiccion,
          totalSueldos: sueldosData.total,
          totalEjecuciones: executionData.total,
          totalGeneral: sueldosData.total + executionData.total,
          sueldosCount: sueldosData.count,
          ejecucionesCount: executionData.count
        };
      });
      
      setJurisdiccionTotals(combinedData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing spending data:", err);
      setError("Error al procesar los datos");
      setLoading(false);
    }
  }, []);

  // Sort the data based on sortOrder
  const sortedJurisdicciones = [...jurisdiccionTotals].sort((a, b) => 
    sortOrder === "desc" 
      ? b.totalGeneral - a.totalGeneral 
      : a.totalGeneral - b.totalGeneral
  ).slice(0, 10); // Show top 10 jurisdictions

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-blue-900 dark:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
       
        <section className="w-full max-w-4xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Ultimos gastos</h2>
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
          ) : sortedJurisdicciones.length === 0 ? (
            <p className="text-center text-blue-900 dark:text-white">No hay datos disponibles.</p>
          ) : (
            <div>
              <div className="flex justify-end mb-2">
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
              
              <ul className="space-y-4">
                {sortedJurisdicciones.map((item, index) => (
                  <li
                    key={index}
                    className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30 hover:bg-opacity-80 dark:hover:bg-opacity-40 transition-colors"
                  >
                    <Link href={`/gastos/${encodeURIComponent(item.jurisdiccion)}`} className="block">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-xl">💼</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-blue-900 dark:text-white mb-2 font-semibold">{item.jurisdiccion}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <div>
                              <span className="font-medium">Sueldos:</span> {formatCurrency(item.totalSueldos)}
                              <span className="text-gray-500 dark:text-gray-400 ml-1">({item.sueldosCount})</span>
                            </div>
                            <div>
                              <span className="font-medium">Ejecuciones:</span> {formatCurrency(item.totalEjecuciones)}
                              <span className="text-gray-500 dark:text-gray-400 ml-1">({item.ejecucionesCount})</span>
                            </div>
                            <div className="font-semibold text-blue-900 dark:text-blue-300">
                              Total: {formatCurrency(item.totalGeneral)}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 self-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 text-center">
                <Link href="/gastos" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Ver todos los gastos →
                </Link>
              </div>
            </div>
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


