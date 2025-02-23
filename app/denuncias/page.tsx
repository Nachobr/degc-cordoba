"use client"
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Denuncias() {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Denuncia enviada:', formData);
    setSubmitted(true);
    setFormData({ nombre: '', descripcion: '', email: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-blue-900">
      <Navbar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Reportar Desperdicio</h1>
        <p className="mb-6 text-sm md:text-base">
          Ayúdanos a identificar desperdicio o ineficiencias en el gasto público de Córdoba.
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
            <p className="text-green-600 text-center text-sm md:text-base">¡Gracias por tu denuncia! La revisaremos pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-4 md:p-6 border">
            <div>
              <label htmlFor="nombre" className="block mb-2 text-sm font-medium">Nombre (opcional)</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="descripcion" className="block mb-2 text-sm font-medium">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium">Email (opcional, para respuestas)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Enviar Denuncia
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}