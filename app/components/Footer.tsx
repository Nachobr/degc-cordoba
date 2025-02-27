"use client";
export default function Footer() {
    return (
      <footer className="bg-blue-800 text-white p-4 text-center">
        <div className="flex justify-center space-x-4 mb-3">
          <a 
            href="https://x.com/DOGEargent" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Twitter/X"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
        <p className="mb-2">&copy; 2025 Departamento de Eficiencia Gubernamental de Córdoba. Todos los derechos reservados.</p>
        <p className="text-sm opacity-80">
          Este sitio no es oficial. Los datos son obtenidos del Portal de Transparencia de la Provincia de Córdoba 
          y se presentan con fines informativos.
        </p>
      </footer>
    );
  }