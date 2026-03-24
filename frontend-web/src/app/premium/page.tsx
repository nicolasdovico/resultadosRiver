'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPreference } from '@/api/generated/endpoints/payments/payments';
import { useAuth } from '@/context/AuthContext';

export default function PremiumPage() {
  const router = useRouter();
  const { isPremium, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await createPreference();
      const { init_point } = response.data as any;
      if (init_point) {
        window.location.href = init_point;
      }
    } catch (error) {
      console.error('Error creating preference:', error);
      alert('No se pudo iniciar el proceso de pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-8 border-yellow-400">
          <div className="text-5xl mb-4">👑</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Ya eres Premium!</h1>
          <p className="text-gray-600 mb-6">Gracias por apoyar a Resultados River. Tienes acceso a todos los beneficios activos.</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Pasate a Premium</h1>
        <p className="text-xl text-gray-600">Accedé a estadísticas avanzadas, gráficos históricos y mucho más.</p>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-red-600 p-8 text-white text-center">
          <h2 className="text-2xl font-bold">Socio Semestral</h2>
          <div className="mt-4">
            <span className="text-4xl font-black">$5000</span>
            <span className="text-red-100">/ 6 meses</span>
          </div>
        </div>

        <div className="p-8">
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-gray-700">
              <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3">✓</span>
              Estadísticas detalladas por jugador
            </li>
            <li className="flex items-center text-gray-700">
              <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3">✓</span>
              Gráficos de rendimiento histórico
            </li>
            <li className="flex items-center text-gray-700">
              <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3">✓</span>
              Reportes exclusivos post-partido
            </li>
            <li className="flex items-center text-gray-700">
              <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3">✓</span>
              Navegación sin publicidad
            </li>
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Procesando...'
            ) : (
              <>
                Suscribirme con <span className="font-black italic">Mercado Pago</span>
              </>
            )}
          </button>
          
          <p className="mt-4 text-center text-xs text-gray-400">
            Serás redirigido a Mercado Pago para completar tu pago de forma segura.
          </p>
        </div>
      </div>
    </div>
  );
}
