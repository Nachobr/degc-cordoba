"use client";
import Link from 'next/link';
import { useTheme } from '@/app/components/ThemeProvider';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVotacionesOpen, setIsVotacionesOpen] = useState(false);
  // Add a new state for mobile votaciones dropdown
  const [isMobileVotacionesOpen, setIsMobileVotacionesOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Add this after the existing Desktop menu links
  const VotacionesDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsVotacionesOpen(!isVotacionesOpen)}
        className="text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
      >
        Votaciones Nacionales
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isVotacionesOpen && (
        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <a
              href="https://senadores.argentinadatos.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-blue-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900"
              onClick={() => setIsVotacionesOpen(false)}
            >
              Votaciones Senadores
            </a>
            <a
              href="https://diputados.argentinadatos.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-blue-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900"
              onClick={() => setIsVotacionesOpen(false)}
            >
              Votaciones Diputados
            </a>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 md:px-6 lg:px-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
            <img
              src="/dogearg.jpg"
              alt="DEGC Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <Link href="/" className="text-xl font-bold text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300">
              Departamento de Eficiencia Gubernamental de Argentina
            </Link>
            <p className="text-xs text-blue-700 dark:text-blue-300 hidden sm:block">
              La reforma que votó el pueblo.
            </p>
          </div>
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
          <a
            href="https://bsaenz.shinyapps.io/pauta-cordoba/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium"
          >
            Pauta Publicitaria
          </a>
          <VotacionesDropdown />
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
      {/* Update the mobile menu section */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/gastos"
            className="block text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Gastos
          </Link>
          <a
            href="https://bsaenz.shinyapps.io/pauta-cordoba/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Pauta Publicitaria
          </a>
          
          {/* Replace the old votaciones section with this new dropdown */}
          <div>
            <button
              onClick={() => setIsMobileVotacionesOpen(!isMobileVotacionesOpen)}
              className="w-full text-left text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium flex items-center justify-between"
            >
              <span>Votaciones Nacionales</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transform transition-transform ${isMobileVotacionesOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`${isMobileVotacionesOpen ? 'block' : 'hidden'} pl-4`}>
              <a
                href="https://senadores.argentinadatos.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Votaciones Senadores
              </a>
              <a
                href="https://diputados.argentinadatos.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Votaciones Diputados
              </a>
            </div>
          </div>
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