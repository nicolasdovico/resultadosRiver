import { formatLocalDate } from "@/utils/date";
import { ChevronLeft, Trophy, Star, TrendingUp, Calendar, Hash, Timer, Target, Shield, Zap, Activity, ChevronRight, Lock, Info, Percent, Award, UserRound } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";
import Image from "next/image";
import { cookies } from "next/headers";
import { sanitizeImageUrl } from "@/utils/image";
import PlayerGoalsAnalysis from "@/components/player/PlayerGoalsAnalysis";
import PlayerGoalMethodAnalysis from "@/components/player/PlayerGoalMethodAnalysis";

interface Partido {
  fecha: string;
  goles_river: number;
  goles_rival: number;
  resultado: 'G' | 'E' | 'P';
  torneo?: { tor_desc: string };
  rival?: { ri_desc: string, escudo_url?: string };
  fase?: { fa_desc: string };
}

interface Tecnico {
  id_tecnicos: number;
  tec_ape_nom: string;
  tec_foto?: string | null;
  desde: string;
  hasta: string;
  cargo: string;
  partidos_count: number;
  stats?: {
    pj: number;
    pg: number;
    pe: number;
    pp: number;
    gf: number;
    gc: number;
    dg: number;
    puntos: number;
    efectividad: number;
  };
  goles_por_periodo?: any[];
  goles_por_tipo?: any[];
  top_scorers?: {
    pl_id: number;
    name: string;
    goals: number;
    pl_foto: string | null;
  }[];
  partidos: Partido[];
  partidos_meta?: {
    current_page: number;
    last_page: number;
    total: number;
  } | null;
  is_premium_restricted?: boolean;
}

export default async function TecnicoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const currentPage = typeof sParams.page === "string" ? parseInt(sParams.page, 10) : 1;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const userRole = cookieStore.get("user_role")?.value;
  const isLoggedIn = !!token;
  const isPremium = userRole === "premium";
  
  const currentTier: "guest" | "registered" | "premium" = isPremium ? "premium" : (isLoggedIn ? "registered" : "guest");

  const fetchOptions = { headers: token ? { "Authorization": `Bearer ${token}` } : {} } as any;

  let tecnico: Tecnico | null = null;
  try {
    const response = await customInstance<{ data: Tecnico }>({
      url: `/v1/tecnicos/${id}`,
      method: "GET",
      params: { page: currentPage },
      ...fetchOptions
    });
    // Laravel resources wrap the response in a 'data' property
    tecnico = response.data;
  } catch (error) {
    console.error("Error fetching tecnico:", error);
  }

  if (!tecnico) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
          <UserRound size={40} />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 uppercase italic tracking-tighter">Técnico no encontrado</h1>
        <Link href="/tecnicos" className="text-red-600 font-black uppercase text-xs tracking-widest hover:underline mt-8 inline-block">
          Volver al archivo completo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/30 pb-24">
      {/* Navigation */}
      <div className="bg-white border-b border-zinc-100 mb-12">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Link href="/tecnicos" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors group">
            <ChevronLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver al archivo histórico
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Profile - Estética Data Console */}
        <section className="bg-zinc-900 rounded-[48px] p-8 md:p-16 shadow-2xl relative overflow-hidden mb-16 border-4 border-white">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
            <Activity size={320} className="text-white" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="relative">
              <div className="w-48 h-64 md:w-64 md:h-80 bg-zinc-800 rounded-[40px] flex items-center justify-center text-white font-black text-8xl shadow-2xl border-4 border-zinc-700 relative group overflow-hidden">
                {tecnico.tec_foto ? (
                  <>
                    <Image 
                      src={sanitizeImageUrl(tecnico.tec_foto)} 
                      alt="" 
                      fill 
                      unoptimized
                      className={`object-cover object-top transition-all duration-700 ${!isPremium ? 'blur-2xl grayscale scale-110' : 'group-hover:scale-105'}`} 
                    />
                    {!isPremium && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="flex flex-col items-center px-6 text-center">
                          <Lock size={24} className="text-red-500 mb-2" />
                          <span className="text-[10px] text-white font-black uppercase tracking-widest leading-tight">Contenido<br/>Premium</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="relative z-10">{tecnico.tec_ape_nom?.charAt(0) || "?"}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-xl border-4 border-zinc-900">
                <Award size={24} className="fill-current" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20">Director Técnico</span>
                <span className="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-700">{tecnico.cargo || 'Entrenador'}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-10 italic">
                {tecnico.tec_ape_nom}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Partidos Dirigidos</span>
                  </div>
                  <span className="block text-4xl font-black text-white tabular-nums">
                    {tecnico.partidos_count}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Total de encuentros oficiales</span>
                </div>

                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Periodo del Ciclo</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="block text-sm font-black text-white uppercase truncate">
                      Desde: {tecnico.desde ? tecnico.desde.split('-').reverse().join('-') : 'N/A'}
                    </span>
                    <span className="block text-sm font-black text-zinc-400 uppercase truncate">
                      Hasta: {tecnico.hasta ? tecnico.hasta.split('-').reverse().join('-') : 'Actualidad'}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Efectividad</span>
                  </div>
                  <span className="block text-4xl font-black text-white tabular-nums">
                    {tecnico.stats?.efectividad !== undefined ? `${tecnico.stats.efectividad}%` : '---'}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Métrica de rendimiento</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic flex items-center">
                <Activity className="mr-4 text-red-600" size={24} />
                Historial de Partidos
              </h2>
              {tecnico.is_premium_restricted && (
                <span className="bg-zinc-100 text-zinc-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-200">
                  Vista Limitada
                </span>
              )}
            </div>

            <div className="space-y-4">
              {(tecnico.partidos || []).map((partido, index) => (
                <div key={index} className="bg-white p-6 rounded-[40px] border border-zinc-100 flex items-center justify-between shadow-sm group hover:border-red-600 transition-all duration-300">
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shadow-inner group-hover:scale-110 transition-transform overflow-hidden relative p-2">
                      {partido.rival?.escudo_url ? (
                        <Image 
                          src={sanitizeImageUrl(partido.rival.escudo_url)} 
                          alt="" 
                          fill 
                          unoptimized
                          className="object-contain p-2" 
                        />
                      ) : (
                        <Shield size={20} className="text-zinc-200" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{formatLocalDate(partido.fecha)}</span>
                        <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{partido.torneo?.tor_desc || 'Amistoso'}</span>
                      </div>
                      <h4 className="font-black text-lg text-zinc-900 uppercase tracking-tight group-hover:text-red-600 transition-colors">
                        vs {partido.rival?.ri_desc || 'Rival'}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                         <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                           partido.resultado === 'G' ? "bg-green-100 text-green-700" : 
                           partido.resultado === 'P' ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-700"
                         }`}>
                           {partido.goles_river} - {partido.goles_rival}
                         </span>
                         <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">• {partido.fase?.fa_desc || 'Fase No Definida'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-zinc-50 w-12 h-12 rounded-full flex items-center justify-center text-zinc-300 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))}

              {tecnico.is_premium_restricted && (
                <div className="mt-8 relative overflow-hidden rounded-[48px] border-4 border-white shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black opacity-95" />
                  <div className="relative z-10 p-12 text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
                      <Lock size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">
                      Archivo Restringido
                    </h3>
                    <p className="text-zinc-400 font-medium mb-10 max-w-md mx-auto leading-relaxed text-sm">
                      Estás viendo los últimos encuentros. Los socios <span className="text-white font-bold">Premium</span> pueden navegar por el historial completo de cada ciclo.
                    </p>
                    <Link href="/premium" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl inline-block">
                      Hacerme Premium Ahora
                    </Link>
                  </div>
                </div>
              )}
              
              {!tecnico.is_premium_restricted && (tecnico.partidos_meta?.last_page || 1) > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  {currentPage > 1 ? (
                    <Link 
                      href={`/tecnicos/${id}?page=${currentPage - 1}`}
                      className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-600 font-black text-xs uppercase tracking-widest hover:border-zinc-900 hover:text-white transition-all shadow-sm"
                    >
                      Anterior
                    </Link>
                  ) : (
                    <span className="px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-300 font-black text-xs uppercase tracking-widest cursor-not-allowed">
                      Anterior
                    </span>
                  )}
                  <div className="bg-zinc-100 px-6 py-3 rounded-2xl">
                    <span className="text-zinc-600 font-black text-xs uppercase tracking-widest">
                      Página {currentPage} de {tecnico.partidos_meta?.last_page}
                    </span>
                  </div>
                  {currentPage < (tecnico.partidos_meta?.last_page || 1) ? (
                    <Link 
                      href={`/tecnicos/${id}?page=${currentPage + 1}`}
                      className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-600 font-black text-xs uppercase tracking-widest hover:border-zinc-900 hover:text-white transition-all shadow-sm"
                    >
                      Siguiente
                    </Link>
                  ) : (
                    <span className="px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-300 font-black text-xs uppercase tracking-widest cursor-not-allowed">
                      Siguiente
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-zinc-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden border-4 border-white flex flex-col min-h-[400px]">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Percent size={120} />
                </div>
                
                {!isPremium && (
                  <div className="absolute inset-0 z-30 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center p-10 text-center">
                    <Lock size={28} className="text-red-500 mb-4" />
                    <h4 className="text-white font-black uppercase tracking-tighter text-xl mb-3 italic">Estadísticas Pro</h4>
                    <p className="text-zinc-300 text-[10px] font-medium mb-8 leading-relaxed uppercase tracking-wider">
                      Analítica de efectividad, puntos por torneo y comparativas históricas.
                    </p>
                    <Link href="/premium" className="bg-red-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                      Hacerme Premium
                    </Link>
                  </div>
                )}

                <h3 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-red-500 italic">Resumen de Ciclo</h3>
                
                <div className={`space-y-4 relative z-10 ${!isPremium ? 'opacity-20 blur-sm pointer-events-none' : ''}`}>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Victorias</span>
                        <span className="text-xl font-black italic">{tecnico.stats?.pg ?? '0'}</span>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Empates</span>
                        <span className="text-xl font-black italic">{tecnico.stats?.pe ?? '0'}</span>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Derrotas</span>
                        <span className="text-xl font-black italic">{tecnico.stats?.pp ?? '0'}</span>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Puntos</span>
                        <span className="text-xl font-black italic text-yellow-500">{tecnico.stats?.puntos ?? '0'}</span>
                     </div>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 mt-4">
                      <div>
                        <span className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Goles a Favor</span>
                        <span className="text-2xl font-black italic text-blue-400">{tecnico.stats?.gf ?? '0'}</span>
                      </div>
                      <Zap size={20} className="text-blue-500" />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <span className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Goles en Contra</span>
                        <span className="text-2xl font-black italic text-red-400">{tecnico.stats?.gc ?? '0'}</span>
                      </div>
                      <Shield size={20} className="text-red-500" />
                   </div>
                </div>
             </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex flex-col mb-10">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight uppercase italic">Analítica de Resultados</h2>
            <p className="text-zinc-500 font-medium uppercase text-xs tracking-widest">Distribución de goles (a favor y en contra) durante el ciclo.</p>
          </div>

          <div className="relative">
            {!isPremium && (
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center p-8 text-center rounded-[48px] border-2 border-dashed border-red-200">
                <Shield size={48} className="text-red-600 mb-4" />
                <h4 className="font-black text-zinc-900 uppercase tracking-tighter text-3xl mb-4 italic">Análisis Exclusivo para Socios</h4>
                <p className="text-zinc-500 text-lg font-medium mb-10 max-w-md">
                  El desglose por tiempo y método de definición del ciclo completo está disponible solo para socios Premium.
                </p>
                <Link href="/premium" className="bg-zinc-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                  Quiero ser Premium
                </Link>
              </div>
            )}

            <div className={`rounded-[40px] overflow-hidden shadow-2xl border border-zinc-100 ${!isPremium ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="flex flex-col">
                <PlayerGoalsAnalysis 
                  data={tecnico.goles_por_periodo || []} 
                  total={tecnico.stats?.gf ? tecnico.stats.gf + tecnico.stats.gc : 0} 
                />
                <PlayerGoalMethodAnalysis 
                  data={tecnico.goles_por_tipo || []} 
                  total={tecnico.stats?.gf ? tecnico.stats.gf + tecnico.stats.gc : 0} 
                />

                {/* Top Scorers during Cycle */}
                {tecnico.top_scorers && tecnico.top_scorers.length > 0 && (
                  <div className="bg-zinc-900 p-8 md:p-12 border-t border-white/5">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] bg-red-500/10 px-3 py-1 rounded-full w-fit mb-2">Artilleros del Ciclo</span>
                        <h4 className="text-2xl font-black tracking-tight text-white">Máximos Goleadores</h4>
                      </div>
                      <div className="flex items-center text-zinc-400">
                        <Award size={16} className="mr-2 text-yellow-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Podio del Ciclo</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {tecnico.top_scorers.map((scorer, idx) => (
                        <div key={scorer.pl_id} className="relative bg-white/5 rounded-3xl p-4 border border-white/5 hover:bg-white/10 transition-all group/scorer overflow-hidden">
                          {/* Position Badge */}
                          <div className={`absolute top-0 right-0 w-8 h-8 flex items-center justify-center font-black text-xs rounded-bl-xl z-20 ${
                            idx === 0 ? 'bg-yellow-500 text-zinc-900' :
                            idx === 1 ? 'bg-zinc-300 text-zinc-900' :
                            'bg-orange-700 text-white'
                          }`}>
                            #{idx + 1}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-white/10 group-hover/scorer:border-red-500/50 transition-colors relative">
                                {scorer.pl_foto ? (
                                  <Image 
                                    src={sanitizeImageUrl(scorer.pl_foto)} 
                                    alt={scorer.name}
                                    fill
                                    unoptimized
                                    className="object-cover object-top"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                    <UserRound size={24} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-black text-white truncate group-hover/scorer:text-red-50 transition-colors uppercase italic">{scorer.name}</h5>
                              <div className="flex items-center mt-1">
                                <Target size={12} className="text-red-500 mr-1.5 shrink-0" />
                                <span className="text-lg font-black text-white tracking-tighter">{scorer.goals}</span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase ml-1.5 tracking-widest">Goles</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
