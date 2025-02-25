"use client";
import Link from 'next/link';
import { useTheme } from '@/app/components/ThemeProvider';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 md:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link href="/" className="text-xl font-bold text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300">
            DEGC Córdoba
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Link href="/gastos" className="text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">
            Gastos
          </Link>
          <Link href="/denuncias" className="text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium">
            Denuncias
          </Link>
          
          <button
            onClick={toggleTheme}
            className="text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}