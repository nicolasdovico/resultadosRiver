import { formatLocalDate } from "@/utils/date";
import { ChevronLeft, Trophy, Star, TrendingUp, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";

interface Gol {
  gol_fecha: string;
  minutos: number;
}

interface Jugador {
  pl_id: number;
  pl_apno: string;
  goles: Gol[];
}

export default async function JugadorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Mock current user tier (Set to 'registered' or 'premium' to test)
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';

  let jugador: Jugador | null = null;
  try {
    const response = await customInstance<{ data: Jugador }>({
      url: `/v1/jugadores/${id}`,
      method: 'GET',
    });
    jugador = response.data;
  } catch (error) {
    console.error("Error fetching jugador:", error);
  }

  if (!jugador) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-zinc-900">Jugador no encontrado</h1>
        <Link href="/jugadores" className="text-red-600 font-bold hover:underline mt-4 inline-block">Volver a la lista</Link>
      </div>
    );
  }

  const totalGoles = jugador.goles?.length || 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Navigation */}
      <Link href="/jugadores" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-xs uppercase tracking-widest mb-8 transition-colors group">
        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver al archivo
      </Link>

      {/* Hero Profile */}
      <section className="bg-white rounded-[40px] border border-zinc-100 p-8 md:p-12 shadow-sm mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Trophy size={240} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
          <div className="w-40 h-40 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 font-black text-6xl shadow-inner border-4 border-white">
            {jugador.pl_apno.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">River Plate</span>
              <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">ID: {jugador.pl_id}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-tight mb-6">
              {jugador.pl_apno}
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
              <div className="bg-zinc-50 p-4 rounded-3xl text-center">
                <span className="block text-2xl font-black text-zinc-900">{totalGoles}</span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Goles Totales</span>
              </div>
              <div className="bg-zinc-50 p-4 rounded-3xl text-center">
                <span className="block text-2xl font-black text-zinc-900">-</span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Presencias</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: List of Goals */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center">
            <Star className="mr-3 fill-red-600 text-red-600" size={20} />
            Historial de Goles
          </h2>

          <AccessControl tier={currentTier} requiredTier="registered">
            {totalGoles > 0 ? (
              <div className="space-y-3">
                {jugador.goles.map((gol, index) => (
                  <div key={index} className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center justify-between shadow-sm group hover:border-red-200 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                        <Hash size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-zinc-800 uppercase text-xs tracking-tight">Gol #{index + 1}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{formatLocalDate(gol.gol_fecha)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-black text-zinc-900">{gol.minutos}'</span>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">minutos</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-[40px] p-12 text-center border-2 border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold">No se registraron goles oficiales para este jugador.</p>
              </div>
            )}
          </AccessControl>
        </div>

        {/* Right Column: Premium Analytics */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center italic">
            <TrendingUp className="mr-3 text-red-600" size={20} />
            Analítica
          </h2>

          <AccessControl tier={currentTier} requiredTier="premium">
            <div className="bg-zinc-900 rounded-[40px] p-8 text-white">
              <h3 className="font-black text-sm uppercase tracking-widest mb-6 text-red-500">Distribución Anual</h3>
              <div className="space-y-6">
                {[
                  { year: '2014', count: 12, max: 15 },
                  { year: '2015', count: 8, max: 15 },
                  { year: '2016', count: 15, max: 15 },
                  { year: '2017', count: 10, max: 15 },
                ].map((item) => (
                  <div key={item.year}>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2 opacity-60">
                      <span>{item.year}</span>
                      <span>{item.count} Goles</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full" style={{ width: `${(item.count / item.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-10 border-t border-white/10">
                <p className="text-[10px] font-medium text-zinc-400 mb-4 leading-relaxed uppercase">
                  Este jugador tiene una efectividad del <span className="text-white font-black">0.XX%</span> por partido jugado.
                </p>
                <div className="p-4 bg-white/5 rounded-2xl">
                   <TrendingUp className="text-red-500 mb-2" size={24} />
                   <p className="text-[8px] font-black uppercase tracking-tighter text-zinc-500">Comparativa vs Promedio Histórico</p>
                </div>
              </div>
            </div>
          </AccessControl>
        </div>
      </div>
    </div>
  );
}
