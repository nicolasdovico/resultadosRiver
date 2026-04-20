import { formatLocalDate } from "@/utils/date";
import { ChevronLeft, Star, Trophy, Calendar, ChevronRight, BarChart3, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";
import ClubShield from "@/components/ClubShield";
import RiverOfficialShield from "@/components/RiverOfficialShield";
import { cookies } from "next/headers";
import GoalsAnalysis from "@/components/GoalsAnalysis";
import GoalMethodAnalysis from "@/components/GoalMethodAnalysis";
import TorneoMatches from "@/components/TorneoMatches";

interface Partido {
  fecha: string;
  fecha_nro?: number;
  goles_river: number;
  goles_rival: number;
  resultado: string;
  rival?: {
    ri_desc: string;
    escudo_url?: string;
  };
  torneo?: {
    tor_desc: string;
    tor_nivel: string;
  };
  fase?: {
    fa_desc: string;
  };
  condicion?: {
    co_desc: string;
  };
}

interface TorneoStats {
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number | null;
  gc: number | null;
  dg: number | null;
  puntos: number | null;
  vallas_invictas: number | null;
  efectividad: number | null;
}

interface TopScorer {
  pl_id: number;
  pl_apno: string;
  pl_foto: string | null;
  goals_count: number;
}

interface Torneo {
  tor_id: number;
  tor_desc: string;
  tor_nivel: string;
  partidos: Partido[];
  stats?: TorneoStats;
  top_scorers?: TopScorer[];
}

export default async function TorneoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userRole = cookieStore.get('user_role')?.value;
  const isLoggedIn = !!token;
  const isPremium = userRole === 'premium';
  
  const currentTier: 'guest' | 'registered' | 'premium' = isPremium ? 'premium' : (isLoggedIn ? 'registered' : 'guest');

  let torneo: Torneo | null = null;
  try {
    const response = await customInstance<{ data: Torneo }>({
      url: `/v1/torneos/${id}`,
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
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
  
  const partidosAsc = [...partidos].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

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
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-tight mb-8">
            {torneo.tor_desc}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
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

            {/* Top Scorers */}
            {torneo.top_scorers && torneo.top_scorers.length > 0 && (
              <div className="flex flex-col items-center md:items-start shrink-0">
                <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                  <Trophy size={14} className="mr-2 text-yellow-500" /> Artilleros Millonarios
                </h3>
                <div className="flex items-center -space-x-5 hover:space-x-2 transition-all duration-500">
                  {torneo.top_scorers.map((scorer, idx) => (
                    <Link 
                      key={scorer.pl_id} 
                      href={`/jugadores/${scorer.pl_id}`}
                      className="group relative"
                      title={scorer.pl_apno}
                    >
                      <div 
                        className={`w-20 h-20 rounded-full overflow-hidden border-4 border-white bg-zinc-100 shadow-xl group-hover:scale-110 group-hover:z-30 transition-all duration-300 relative ${
                          idx === 0 ? 'z-20' : idx === 1 ? 'z-10' : 'z-0'
                        }`}
                      >
                        {scorer.pl_foto ? (
                          <img 
                            src={scorer.pl_foto} 
                            alt={scorer.pl_apno}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-400">
                            <Users size={28} />
                          </div>
                        )}
                        
                        {/* Overlay with name on hover - Improved visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 px-1">
                          <span className="text-[9px] font-black text-white uppercase tracking-tighter text-center leading-none">
                            {scorer.pl_apno.split(',')[0]}
                          </span>
                        </div>
                      </div>
                      
                      {/* Goal Badge */}
                      <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-white shadow-lg z-40 transform group-hover:scale-110 transition-transform">
                        {scorer.goals_count} <span className="text-[7px] ml-0.5">GOLES</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 flex flex-col items-center md:items-start">
                  <p className="text-[9px] font-black text-zinc-900 uppercase tracking-[0.3em]">
                    Podio de Goleadores
                  </p>
                  <div className="h-0.5 w-12 bg-red-600 mt-1"></div>
                </div>
              </div>
            )}
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
            <TorneoMatches partidos={partidos} />
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
              <h3 className="font-black text-sm uppercase tracking-widest mb-6 text-red-500 italic text-center">Eficacia Total</h3>
              
              <div className="relative w-40 h-40 mx-auto mb-10">
                 {/* Visual simulation of a radial progress */}
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * ((torneo.stats?.efectividad || 0) / 100))} className="text-red-600" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{torneo.stats?.efectividad || 0}%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Pts/Rate</span>
                 </div>
              </div>
              
              {/* Form Guide (Racha) */}
              <div className="mb-10">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-center">
                  <TrendingUp size={12} className="mr-1 text-red-500" /> Racha del Torneo
                </h4>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {partidosAsc.map((p, idx) => {
                    const extraInfo = [
                      p.fase?.fa_desc,
                      p.fecha_nro ? `Fecha ${p.fecha_nro}` : null
                    ].filter(Boolean).join(' - ');

                    return (
                      <div 
                        key={idx} 
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black shadow-sm cursor-help transition-transform hover:scale-110 ${
                          p.resultado === 'G' ? 'bg-green-500 text-green-950' : 
                          p.resultado === 'P' ? 'bg-red-500 text-red-950' : 
                          'bg-zinc-500 text-zinc-950'
                        }`}
                        title={`${p.resultado}: ${p.goles_river}-${p.goles_rival} vs ${p.rival?.ri_desc}${extraInfo ? ` (${extraInfo})` : ''}`}
                      >
                        {p.resultado}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center col-span-2">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Puntos Obtenidos</p>
                    <span className="text-3xl font-black text-yellow-500">{torneo.stats?.puntos || 0}</span>
                 </div>
                 <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Goles a Favor</p>
                    <span className="text-xl font-black text-white">{torneo.stats?.gf || 0}</span>
                 </div>
                 <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Goles en Contra</p>
                    <span className="text-xl font-black text-zinc-400">{torneo.stats?.gc || 0}</span>
                 </div>
                 <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Dif. de Gol</p>
                    <span className={`text-xl font-black ${(torneo.stats?.dg || 0) > 0 ? 'text-green-500' : (torneo.stats?.dg || 0) < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                      {(torneo.stats?.dg || 0) > 0 ? '+' : ''}{torneo.stats?.dg || 0}
                    </span>
                 </div>
                 <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Vallas Invictas</p>
                    <span className="text-xl font-black text-white">{torneo.stats?.vallas_invictas || 0}</span>
                 </div>
              </div>
            </div>
          </AccessControl>
        </div>
      </div>

      {/* Premium Analysis Section */}
      <section className="mt-20">
        <div className="flex flex-col mb-10 text-center md:text-left">
          <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight uppercase">Dinámica de Goles del Torneo</h2>
          <p className="text-zinc-500 font-medium">Distribución de goles, efectividad por periodos y formas de conversión a lo largo de toda la competencia.</p>
        </div>

        <AccessControl tier={currentTier} requiredTier="premium" className="rounded-[40px] overflow-hidden shadow-xl border border-zinc-100">
          <div className="flex flex-col">
            <GoalsAnalysis filters={{ torneo: id }} />
            <GoalMethodAnalysis filters={{ torneo: id }} />
          </div>
        </AccessControl>
      </section>
    </div>
  );
}

