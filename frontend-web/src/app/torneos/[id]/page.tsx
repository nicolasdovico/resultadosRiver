import { formatLocalDate } from "@/utils/date";
import { ChevronLeft, Star, Trophy, Calendar, ChevronRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";

interface Partido {
  fecha: string;
  go_ri: number;
  go_ad: number;
  resultado: string;
  rival?: {
    ri_desc: string;
  };
}

interface Torneo {
  tor_id: number;
  tor_desc: string;
  tor_nivel: string;
  partidos: Partido[];
}

export default async function TorneoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Mock current user tier
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';

  let torneo: Torneo | null = null;
  try {
    const response = await customInstance<{ data: Torneo }>({
      url: `/v1/torneos/${id}`,
      method: 'GET',
    });
    torneo = response.data;
  } catch (error) {
    console.error("Error fetching torneo:", error);
  }

  if (!torneo) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Torneo no encontrado</h1>
        <Link href="/torneos" className="text-red-600 font-bold hover:underline mt-4 inline-block uppercase text-xs tracking-widest">Volver a torneos</Link>
      </div>
    );
  }

  const partidos = torneo.partidos || [];
  const victorias = partidos.filter(p => p.resultado === 'G').length;
  const empates = partidos.filter(p => p.resultado === 'E').length;
  const derrotas = partidos.filter(p => p.resultado === 'P').length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Navigation */}
      <Link href="/torneos" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-xs uppercase tracking-widest mb-8 transition-colors group">
        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver a torneos
      </Link>

      {/* Hero Section */}
      <section className="bg-white rounded-[40px] border border-zinc-100 p-8 md:p-12 shadow-sm mb-12 relative overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Star size={240} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
              Nivel {torneo.tor_nivel}
            </span>
            <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              ID: {torneo.tor_id}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-tight mb-8">
            {torneo.tor_desc}
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
            <div className="bg-zinc-50 p-4 rounded-3xl text-center">
              <span className="block text-2xl font-black text-zinc-900">{partidos.length}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Partidos</span>
            </div>
            <div className="bg-zinc-50 p-4 rounded-3xl text-center">
              <span className="block text-2xl font-black text-green-600">{victorias}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Victorias</span>
            </div>
            <div className="bg-zinc-50 p-4 rounded-3xl text-center">
              <span className="block text-2xl font-black text-zinc-400">{empates}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Empates</span>
            </div>
            <div className="bg-zinc-50 p-4 rounded-3xl text-center">
              <span className="block text-2xl font-black text-red-600">{derrotas}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Derrotas</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Matches List */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center">
            <Trophy className="mr-3 text-red-600" size={20} />
            Resultados en este Torneo
          </h2>

          <AccessControl tier={currentTier} requiredTier="registered">
            {partidos.length > 0 ? (
              <div className="space-y-3">
                {partidos.map((p) => (
                  <Link 
                    key={p.fecha} 
                    href={`/partidos/${p.fecha}`}
                    className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center justify-between shadow-sm group hover:border-red-200 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                        {formatLocalDate(p.fecha)}
                      </span>
                      <span className="font-black text-zinc-800 uppercase text-xs tracking-tight group-hover:text-red-600 transition-colors">
                        vs {p.rival?.ri_desc || 'Rival'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xl font-black ${p.resultado === 'G' ? 'text-green-600' : p.resultado === 'P' ? 'text-red-600' : 'text-zinc-400'}`}>
                        {p.go_ri} - {p.go_ad}
                      </span>
                      <ChevronRight className="text-zinc-200 group-hover:text-red-500 transition-colors" size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-[40px] p-12 text-center border-2 border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">No hay partidos registrados para este torneo.</p>
              </div>
            )}
          </AccessControl>
        </div>

        {/* Right Column: Premium Stats */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center italic">
            <BarChart3 className="mr-3 text-red-600" size={20} />
            Análisis de Éxito
          </h2>

          <AccessControl tier={currentTier} requiredTier="premium">
            <div className="bg-zinc-900 rounded-[40px] p-8 text-white">
              <h3 className="font-black text-sm uppercase tracking-widest mb-10 text-red-500 italic text-center">Eficacia Total</h3>
              
              <div className="relative w-40 h-40 mx-auto mb-10">
                 {/* Visual simulation of a radial progress */}
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * (victorias/partidos.length || 0))} className="text-red-600" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{Math.round((victorias/partidos.length)*100) || 0}%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">W/Rate</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Goles a Favor</p>
                    <span className="text-2xl font-black text-white">{partidos.reduce((acc, p) => acc + p.go_ri, 0)}</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Goles en Contra</p>
                    <span className="text-2xl font-black text-zinc-400">{partidos.reduce((acc, p) => acc + p.go_ad, 0)}</span>
                 </div>
              </div>
            </div>
          </AccessControl>
        </div>
      </div>
    </div>
  );
}
