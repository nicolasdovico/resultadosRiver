import { ChevronLeft, Trophy, Calendar, MapPin, Scale, Clock, UserRound, Star } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";

interface Gol {
  gol_id: number;
  minutos: number;
  jugador?: {
    pl_apno: string;
    pl_id: number;
  };
}

interface Partido {
  fecha: string;
  go_ri: number;
  go_ad: number;
  rival?: {
    ri_desc: string;
  };
  torneo?: {
    tor_desc: string;
  };
  estadio?: {
    es_desc: string;
  };
  arbitro?: {
    ar_apno: string;
  };
  condicion?: {
    descripcion: string;
  };
  fase?: {
    fase: string;
  };
  goles: Gol[];
}

export default async function PartidoDetailPage({
  params,
}: {
  params: Promise<{ fecha: string }>;
}) {
  const { fecha } = await params;
  
  // Mock current user tier
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';

  let partido: Partido | null = null;
  try {
    const response = await customInstance<{ data: Partido }>({
      url: `/v1/partidos/${fecha}`,
      method: 'GET',
    });
    partido = response.data;
  } catch (error) {
    console.error("Error fetching partido:", error);
  }

  if (!partido) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Partido no encontrado</h1>
        <Link href="/partidos" className="text-red-600 font-bold hover:underline mt-4 inline-block uppercase text-xs tracking-widest">Volver al historial</Link>
      </div>
    );
  }

  const riverGoles = partido.goles || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Navigation */}
      <Link href="/partidos" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-xs uppercase tracking-widest mb-8 transition-colors group">
        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver al historial
      </Link>

      {/* Scoreboard Hero */}
      <section className="bg-zinc-900 rounded-[40px] p-8 md:p-16 text-white mb-12 relative overflow-hidden shadow-2xl shadow-red-950/20">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Trophy size={300} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              {partido.torneo?.tor_desc || 'Torneo Oficial'}
            </span>
            <span className="text-zinc-400 font-black text-xs uppercase tracking-widest">
              {new Date(partido.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20">
            {/* River */}
            <div className="flex flex-col items-center md:items-end flex-1">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-3">
                 <Trophy className="text-red-600" size={48} />
              </div>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">River Plate</h2>
              <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">{partido.condicion?.descripcion || 'Local'}</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-6">
              <span className="text-7xl md:text-9xl font-black tracking-tighter text-white">{partido.go_ri}</span>
              <span className="text-2xl md:text-4xl font-black text-zinc-700 italic">VS</span>
              <span className="text-7xl md:text-9xl font-black tracking-tighter text-zinc-400">{partido.go_ad}</span>
            </div>

            {/* Rival */}
            <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left">
              <div className="w-24 h-24 bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl -rotate-3 border border-zinc-700">
                 <UserRound className="text-zinc-500" size={48} />
              </div>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">{partido.rival?.ri_desc || 'Rival'}</h2>
              <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Visitante</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Match Info & Goals */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
             <div className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center space-x-4 shadow-sm">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                   <MapPin size={24} />
                </div>
                <div>
                   <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">Estadio</span>
                   <span className="font-black text-zinc-900 uppercase text-sm tracking-tight">{partido.estadio?.es_desc || 'No especificado'}</span>
                </div>
             </div>
             <div className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center space-x-4 shadow-sm">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                   <Scale size={24} />
                </div>
                <div>
                   <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">Árbitro</span>
                   <span className="font-black text-zinc-900 uppercase text-sm tracking-tight">{partido.arbitro?.ar_apno || 'No especificado'}</span>
                </div>
             </div>
          </div>

          <h3 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center italic">
            <Star className="mr-3 fill-red-600 text-red-600" size={20} />
            Goleadores de River
          </h3>

          <AccessControl tier={currentTier} requiredTier="registered">
            {riverGoles.length > 0 ? (
              <div className="space-y-3">
                {riverGoles.map((gol) => (
                  <div key={gol.gol_id} className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center justify-between shadow-sm group hover:border-red-200 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <Clock size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-zinc-900 uppercase text-sm tracking-tighter">{gol.jugador?.pl_apno || 'Jugador de River'}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gol Oficial</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl font-black text-zinc-900">{gol.minutos}'</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-[40px] p-12 text-center border-2 border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.2em]">No hay detalle de goles para este encuentro.</p>
              </div>
            )}
          </AccessControl>
        </div>

        {/* Premium Section */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase italic">Análisis</h2>
          
          <AccessControl tier={currentTier} requiredTier="premium">
            <div className="bg-zinc-100 rounded-[40px] p-8">
               <h4 className="font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-6 italic">Incidencias por tiempo</h4>
               <div className="space-y-10 py-4">
                  <div className="relative h-2 bg-zinc-200 rounded-full">
                     <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-md shadow-red-900/20" />
                     <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-md shadow-red-900/20" />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase tracking-tighter">
                     <span>Inicio</span>
                     <span>Entretiempo</span>
                     <span>Final</span>
                  </div>
               </div>
               
               <div className="mt-8 p-6 bg-white rounded-3xl border border-zinc-200/50">
                  <p className="text-[10px] font-medium text-zinc-500 leading-relaxed uppercase">
                    River Plate ha ganado el <span className="text-zinc-900 font-black">72%</span> de los partidos cuando comienza ganando antes del minuto 30'.
                  </p>
               </div>
            </div>
          </AccessControl>
        </div>
      </div>
    </div>
  );
}
