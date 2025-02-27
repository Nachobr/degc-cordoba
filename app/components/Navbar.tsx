"use client";
import Link from 'next/link';
import { useTheme } from '@/app/components/ThemeProvider';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 md:px-6 lg:px-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300">
            DEGC Córdoba
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="sm:hidden">
          <button 
            onClick={toggleMenu}
            className="text-blue-900 dark:text-white p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden sm:flex space-x-4">
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

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            href="/gastos" 
            className="block text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Gastos
          </Link>
          <Link 
            href="/denuncias" 
            className="block text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Denuncias
          </Link>
          <button
            onClick={() => {
              toggleTheme();
              setIsMenuOpen(false);
            }}
            className="w-full text-left text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌞 Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </div>
      </div>
    </nav>
  );
}