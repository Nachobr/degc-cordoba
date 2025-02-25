"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

interface SpendingDataItem {
  jurisdiccion: string;
  unidadOrganigrama: string;
  unidadSuperior: string;
  cargo: string;
  montoBruto: number;
  aportesPersonales: number;
  contribucionesPatronales: number;
}

export default function Home() {
  const [recentSpending, setRecentSpending] = useState<SpendingDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentSpending() {
      setLoading(true);
      setError(null);
      try {
        const url = `https://transparencia.cba.gov.ar/HandlerSueldos.ashx?anio=2024&mes=02&rows=10&page=1&sidx=invdate&sord=desc`;
        const response = await fetch(url, {
          headers: {
            "Accept": "application/xml",
            "Content-Type": "application/xml",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlText = await response.text();
        if (!xmlText || xmlText.trim().length === 0) {
          throw new Error("Received empty response from server");
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const rows = xmlDoc.getElementsByTagName("row");
        const data = Array.from(rows).map((row) => {
          const cells = row.getElementsByTagName("cell");
          return {
            jurisdiccion: cells[0].textContent || "Sin Jurisdicción",
            unidadOrganigrama: cells[1].textContent || "Sin Unidad",
            unidadSuperior: cells[2].textContent || "Sin Superior",
            cargo: cells[3].textContent || "Sin Cargo",
            montoBruto: parseInt(cells[4].textContent || "0"),
            aportesPersonales: parseInt(cells[5].textContent || "0"),
            contribucionesPatronales: parseInt(cells[6].textContent || "0"),
          };
        });

        const sortedData = data
          .sort((a, b) => b.montoBruto - a.montoBruto)
          .slice(0, 10);

        setRecentSpending(sortedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recent spending:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setLoading(false);
      }
    }

    fetchRecentSpending();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-blue-900">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Departamento de Eficiencia Gubernamental de Córdoba
        </h1>
        <p className="text-lg text-center mb-6">
          ¡Seguí el Gasto de Córdoba en Tiempo Real! Reduzcamos el desperdicio, aumentemos la eficiencia.
        </p>

        <section className="w-full max-w-4xl mb-8">
          <h2 className="text-2xl font-semibold mb-4">Gastos Recientes en Sueldos</h2>
          {loading ? (
            <p className="text-center">Cargando datos...</p>
          ) : error ? (
            <div className="text-center text-red-600">
              <p>{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                Intentar de nuevo
              </button>
            </div>
          ) : recentSpending.length === 0 ? (
            <p className="text-center">No hay datos disponibles.</p>
          ) : (
            <ul className="space-y-4">
              {recentSpending.map((item, index) => (
                <li
                  key={index}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.jurisdiccion}</p>
                    <p className="text-sm text-gray-600">{item.cargo}</p>
                    <p className="text-xs text-gray-500">{item.unidadOrganigrama}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${item.montoBruto.toLocaleString("es-AR")}
                    </p>
                    <p className="text-xs text-gray-500">Monto Bruto</p>
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
