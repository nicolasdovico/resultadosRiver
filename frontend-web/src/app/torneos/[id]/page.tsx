import { formatLocalDate } from "@/utils/date";
import { ChevronLeft, Star, Trophy, Calendar, ChevronRight, BarChart3, TrendingUp, Users, Target, Shield } from "lucide-react";
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
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic">Torneo no encontrado</h1>
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
    <div className="min-h-screen bg-zinc-50/50 pb-24">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Navigation */}
        <Link href="/torneos" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-xs uppercase tracking-[0.2em] mb-8 transition-colors group italic">
          <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Archivo de Torneos
        </Link>

        {/* Hero Section - Data Console Aesthetic */}
        <section className="bg-zinc-900 rounded-[48px] border border-zinc-800 p-8 md:p-16 shadow-2xl shadow-zinc-950/50 mb-12 relative overflow-hidden text-center md:text-left">
          <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none rotate-12 text-white">
            <Trophy size={400} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
              <span className="bg-red-600/10 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20 shadow-lg shadow-red-900/10">
                Nivel {torneo.tor_nivel}
              </span>
              <span className="bg-zinc-800 text-zinc-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-700">
                Registro Histórico
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-12 italic">
              {torneo.tor_desc}
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-white/5 text-center group hover:bg-zinc-800 transition-all">
                  <span className="block text-4xl font-black text-white tabular-nums tracking-tighter mb-1">{partidos.length}</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Partidos</span>
                </div>
                <div className="bg-emerald-950/20 p-6 rounded-[32px] border border-emerald-500/10 text-center group hover:bg-emerald-900/20 transition-all">
                  <span className="block text-4xl font-black text-emerald-500 tabular-nums tracking-tighter mb-1">{victorias}</span>
                  <span className="text-[9px] font-black text-emerald-600/50 uppercase tracking-widest">Victorias</span>
                </div>
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-white/5 text-center group hover:bg-zinc-800 transition-all">
                  <span className="block text-4xl font-black text-zinc-400 tabular-nums tracking-tighter mb-1">{empates}</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Empates</span>
                </div>
                <div className="bg-red-950/20 p-6 rounded-[32px] border border-red-500/10 text-center group hover:bg-red-900/20 transition-all">
                  <span className="block text-4xl font-black text-red-500 tabular-nums tracking-tighter mb-1">{derrotas}</span>
                  <span className="text-[9px] font-black text-red-600/50 uppercase tracking-widest">Derrotas</span>
                </div>
              </div>

              {/* Top Scorers */}
              {torneo.top_scorers && torneo.top_scorers.length > 0 && (
                <div className="flex flex-col items-center md:items-start shrink-0">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center italic">
                    <Star size={14} className="mr-2 text-yellow-500 fill-yellow-500" /> Artilleros Millonarios
                  </h3>
                  <div className="flex items-center -space-x-6 hover:space-x-3 transition-all duration-700">
                    {torneo.top_scorers.map((scorer, idx) => (
                      <Link 
                        key={scorer.pl_id} 
                        href={`/jugadores/${scorer.pl_id}`}
                        className="group relative"
                        title={scorer.pl_apno}
                      >
                        <div 
                          className={`w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-900 bg-zinc-800 shadow-2xl group-hover:scale-110 group-hover:z-30 transition-all duration-500 relative ring-4 ring-transparent group-hover:ring-red-600/50 ${
                            idx === 0 ? 'z-20' : idx === 1 ? 'z-10' : 'z-0'
                          }`}
                        >
                          {scorer.pl_foto ? (
                            <img 
                              src={scorer.pl_foto} 
                              alt={scorer.pl_apno}
                              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-700 text-zinc-500">
                              <Users size={32} />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 px-1">
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter text-center leading-none italic">
                              {scorer.pl_apno.split(',')[0]}
                            </span>
                          </div>
                        </div>
                        
                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full border-2 border-zinc-900 shadow-xl z-40 transform group-hover:scale-110 transition-transform">
                          {scorer.goals_count} <span className="text-[7px] ml-0.5 opacity-70">GOLS</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-col items-center md:items-start">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">
                      Goleadores CARP
                    </p>
                    <div className="h-1 w-16 bg-red-600 mt-2 rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Matches List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic flex items-center">
                <Trophy className="mr-3 text-red-600" size={24} />
                Resultados en este Torneo
              </h2>
              <div className="h-px flex-1 bg-zinc-200 ml-8" />
            </div>

            <AccessControl tier={currentTier} requiredTier="registered">
              <TorneoMatches partidos={partidos} />
            </AccessControl>
          </div>

          {/* Right Column: Premium Stats */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-8">
               <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
                  <BarChart3 size={20} />
               </div>
               <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic">
                  Análisis de <span className="text-red-600">Éxito</span>
               </h2>
            </div>

            <AccessControl tier={currentTier} requiredTier="premium">
              <div className="bg-zinc-900 rounded-[48px] p-8 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] mb-8 text-zinc-500 italic text-center relative z-10">Eficacia CARP</h3>
                
                <div className="relative w-48 h-48 mx-auto mb-10 group-hover:scale-105 transition-transform duration-500 relative z-10">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                      <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="534" strokeDashoffset={534 - (534 * ((torneo.stats?.efectividad || 0) / 100))} className="text-red-600 transition-all duration-1000 ease-out" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black italic tracking-tighter tabular-nums">{torneo.stats?.efectividad || 0}%</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-1">Efectividad</span>
                   </div>
                </div>
                
                {/* Form Guide (Racha) */}
                <div className="mb-12 relative z-10">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center justify-center italic">
                    <TrendingUp size={12} className="mr-2 text-red-500" /> Racha del Torneo
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {partidosAsc.map((p, idx) => {
                      const extraInfo = [
                        p.fase?.fa_desc,
                        p.fecha_nro ? `Fecha ${p.fecha_nro}` : null
                      ].filter(Boolean).join(' - ');

                      return (
                        <div 
                          key={idx} 
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-xl cursor-help transition-all hover:scale-125 hover:z-20 ${
                            p.resultado === 'G' ? 'bg-emerald-500 text-emerald-950' : 
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

                <div className="grid grid-cols-2 gap-4 relative z-10">
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center col-span-2 group/card hover:bg-white/10 transition-colors">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">Puntos Acumulados</p>
                      <span className="text-5xl font-black text-yellow-500 tabular-nums italic">{torneo.stats?.puntos || 0}</span>
                   </div>
                   <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center hover:bg-white/10 transition-colors">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Goles CARP</p>
                      <span className="text-2xl font-black text-white tabular-nums">{torneo.stats?.gf || 0}</span>
                   </div>
                   <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center hover:bg-white/10 transition-colors">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">En Contra</p>
                      <span className="text-2xl font-black text-zinc-400 tabular-nums">{torneo.stats?.gc || 0}</span>
                   </div>
                   <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center hover:bg-white/10 transition-colors">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Diferencia</p>
                      <span className={`text-2xl font-black tabular-nums ${(torneo.stats?.dg || 0) > 0 ? 'text-emerald-500' : (torneo.stats?.dg || 0) < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                        {(torneo.stats?.dg || 0) > 0 ? '+' : ''}{torneo.stats?.dg || 0}
                      </span>
                   </div>
                   <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center hover:bg-white/10 transition-colors">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Vallas Inv.</p>
                      <span className="text-2xl font-black text-white tabular-nums">{torneo.stats?.vallas_invictas || 0}</span>
                   </div>
                </div>
              </div>
            </AccessControl>
          </div>
        </div>

        {/* Premium Analysis Section */}
        <section className="mt-20">
          <div className="flex flex-col mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight uppercase italic">Dinámica de Goles del Torneo</h2>
            <p className="text-zinc-500 font-medium">Distribución de goles, efectividad por periodos y formas de conversión a lo largo de toda la competencia.</p>
          </div>

          <AccessControl tier={currentTier} requiredTier="premium" className="rounded-[48px] overflow-hidden shadow-2xl border border-zinc-100">
            <div className="flex flex-col">
              <GoalsAnalysis filters={{ torneo: id }} />
              <GoalMethodAnalysis filters={{ torneo: id }} />
            </div>
          </AccessControl>
        </section>
      </div>
    </div>
  );
}

