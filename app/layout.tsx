import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DEGC Córdoba",
  description: "Departamento de Eficiencia Gubernamental de Córdoba",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white`}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
