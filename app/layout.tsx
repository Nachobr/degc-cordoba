import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

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
      <body className={`${inter.className} bg-white dark:bg-gray-900 dark:text-white transition-colors`}>
        <ThemeProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
