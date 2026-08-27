import { formatLocalDate, calculateDateDuration, calculateMultipleCyclesDuration } from "@/utils/date";
import { ChevronLeft, Trophy, Star, TrendingUp, Calendar, Hash, Timer, Target, Shield, Zap, Activity, ChevronRight, Lock, Info, Percent, Award, UserRound, Layers, Clock } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";
import Image from "next/image";
import { cookies } from "next/headers";
import { sanitizeImageUrl } from "@/utils/image";
import PlayerGoalsAnalysis from "@/components/player/PlayerGoalsAnalysis";
import PlayerGoalMethodAnalysis from "@/components/player/PlayerGoalMethodAnalysis";
import TecnicoMatches from "@/components/TecnicoMatches";

interface Partido {
  fecha: string;
  fecha_nro?: number;
  goles_river: number;
  goles_rival: number;
  resultado: string;
  rival?: { ri_desc: string; escudo_url?: string };
  torneo?: { tor_desc: string };
  fase?: { fa_desc: string };
  condicion?: { co_desc: string };
  estadio?: { es_desc: string };
}

interface TecnicoCiclo {
  id: number;
  numero_ciclo: number;
  desde: string;
  hasta: string | null;
  cargo: string;
  observaciones?: string | null;
  foto_ciclo?: string | null;
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
  } | null;
}

interface Tecnico {
  id_tecnicos: number;
  tec_ape_nom: string;
  tec_foto?: string | null;
  desde: string;
  hasta: string;
  cargo: string;
  total_ciclos?: number;
  active_ciclo_id?: number | null;
  ciclos?: TecnicoCiclo[];
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
  const cicloId = typeof sParams.ciclo_id === "string" ? sParams.ciclo_id : "";
  
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
      params: { 
        ...(cicloId ? { ciclo_id: cicloId } : {})
      },
      ...fetchOptions
    });
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

  const hasMultipleCiclos = (tecnico.ciclos?.length || 0) > 1;
  const activeCiclo = cicloId && tecnico.ciclos 
    ? tecnico.ciclos.find(c => c.id.toString() === cicloId) 
    : null;

  // Best photo: specific cycle photo if available, or coach master photo
  const currentPhoto = activeCiclo?.foto_ciclo || tecnico.tec_foto;

  // Duration calculation
  const singleDuration = activeCiclo 
    ? calculateDateDuration(activeCiclo.desde, activeCiclo.hasta)
    : (tecnico.ciclos && tecnico.ciclos.length === 1)
      ? calculateDateDuration(tecnico.ciclos[0].desde, tecnico.ciclos[0].hasta)
      : null;

  const multiDuration = (!activeCiclo && tecnico.ciclos && tecnico.ciclos.length > 1)
    ? calculateMultipleCyclesDuration(tecnico.ciclos)
    : null;

  return (
    <div className="min-h-screen bg-zinc-50/30 pb-24">
      {/* Navigation */}
      <div className="bg-white border-b border-zinc-100 mb-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Link href="/tecnicos" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors group">
            <ChevronLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver al archivo histórico
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Selector de Ciclos (Tabs Interactivas) */}
        {hasMultipleCiclos && (
          <div className="mb-8 bg-white border border-zinc-200/80 rounded-[32px] p-3 shadow-md shadow-zinc-900/5">
            <div className="flex items-center justify-between px-4 py-2 mb-2 border-b border-zinc-100">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers size={12} className="text-red-500" />
                Ciclos de Conducción ({tecnico.ciclos?.length} etapas registradas)
              </span>
              <span className="text-[10px] font-bold text-zinc-500">
                Selecciona una etapa para filtrar estadísticas
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Tab Global */}
              <Link
                href={`/tecnicos/${id}`}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  !cicloId 
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20" 
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                }`}
              >
                <Trophy size={14} className={!cicloId ? "text-yellow-400" : "text-zinc-400"} />
                Trayectoria Global (Todos los ciclos)
              </Link>

              {/* Tabs por cada Ciclo */}
              {tecnico.ciclos?.map((c) => {
                const isActive = cicloId === c.id.toString();
                return (
                  <Link
                    key={c.id}
                    href={`/tecnicos/${id}?ciclo_id=${c.id}`}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                      isActive 
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-red-500'}`} />
                    Ciclo #{c.numero_ciclo}: {c.desde.split('-')[0]} - {c.hasta ? c.hasta.split('-')[0] : 'Actual'} ({c.cargo})
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Hero Profile - Estética Data Console */}
        <section className="bg-zinc-900 rounded-[48px] p-8 md:p-16 shadow-2xl relative overflow-hidden mb-16 border-4 border-white">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
            <Activity size={320} className="text-white" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="relative">
              <div className="w-48 h-64 md:w-64 md:h-80 bg-zinc-800 rounded-[40px] flex items-center justify-center text-white font-black text-8xl shadow-2xl border-4 border-zinc-700 relative group overflow-hidden">
                {currentPhoto ? (
                  <>
                    <Image 
                      src={sanitizeImageUrl(currentPhoto)} 
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
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20">
                  Director Técnico
                </span>
                {activeCiclo ? (
                  <span className="bg-yellow-400 text-yellow-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Ciclo #{activeCiclo.numero_ciclo} • {activeCiclo.cargo}
                  </span>
                ) : hasMultipleCiclos ? (
                  <span className="bg-zinc-800 text-yellow-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-700">
                    Trayectoria Global ({tecnico.total_ciclos} Ciclos)
                  </span>
                ) : (
                  <span className="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-700">
                    {tecnico.cargo || 'Entrenador'}
                  </span>
                )}
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-10 italic">
                {tecnico.tec_ape_nom}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Partidos */}
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity size={14} className="text-red-500" />
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        {activeCiclo ? "Partidos en este Ciclo" : "Partidos Totales"}
                      </span>
                    </div>
                    <span className="block text-4xl font-black text-white tabular-nums">
                      {tecnico.partidos_count}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter pt-3 border-t border-zinc-700/60 mt-3">
                    {activeCiclo ? `Ciclo #${activeCiclo.numero_ciclo} oficial` : `${tecnico.total_ciclos || 1} ciclos combinados`}
                  </span>
                </div>

                {/* Card 2: Periodo y Duración Detallada */}
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar size={14} className="text-red-500" />
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        {activeCiclo ? `Periodo Ciclo #${activeCiclo.numero_ciclo}` : "Trayectoria Total"}
                      </span>
                    </div>
                    <div className="flex flex-col mb-3">
                      {activeCiclo ? (
                        <div className="flex items-center justify-between text-xs font-black text-white">
                          <span>{activeCiclo.desde ? activeCiclo.desde.split('-').reverse().join('/') : 'N/A'}</span>
                          <span className="text-zinc-500 text-[10px] uppercase font-bold mx-1.5">al</span>
                          <span className={!activeCiclo.hasta ? "text-emerald-400 font-black" : "text-white"}>
                            {activeCiclo.hasta ? activeCiclo.hasta.split('-').reverse().join('/') : 'Actualidad'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs font-black text-white">
                          <span>{tecnico.desde ? tecnico.desde.split('-').reverse().join('/') : 'N/A'}</span>
                          <span className="text-zinc-500 text-[10px] uppercase font-bold mx-1.5">al</span>
                          <span className={!tecnico.hasta ? "text-emerald-400 font-black" : "text-white"}>
                            {tecnico.hasta ? tecnico.hasta.split('-').reverse().join('/') : 'Actualidad'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detalle de Duración y Días Totales */}
                  <div className="pt-2.5 border-t border-zinc-700/60 flex flex-col gap-1.5">
                    {singleDuration && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Duración:</span>
                          <span className="text-xs font-black text-yellow-400 text-right">
                            {singleDuration.formatted}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Días:</span>
                          <span className="text-xs font-black text-white tabular-nums">
                            {singleDuration.totalDays.toLocaleString('es-AR')} días
                          </span>
                        </div>
                      </>
                    )}

                    {multiDuration && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Tiempo Activo:</span>
                          <span className="text-xs font-black text-yellow-400 text-right">
                            {multiDuration.formatted}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Días:</span>
                          <span className="text-xs font-black text-white tabular-nums">
                            {multiDuration.totalDays.toLocaleString('es-AR')} días <span className="text-[9px] text-zinc-500 font-bold">({tecnico.total_ciclos} ciclos)</span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Card 3: Efectividad */}
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp size={14} className="text-red-500" />
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Efectividad</span>
                    </div>
                    <span className="block text-4xl font-black text-white tabular-nums">
                      {tecnico.stats?.efectividad !== undefined ? `${tecnico.stats.efectividad}%` : '---'}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter pt-3 border-t border-zinc-700/60 mt-3">
                    {activeCiclo ? `Rendimiento Ciclo #${activeCiclo.numero_ciclo}` : "Métrica histórica global"}
                  </span>
                </div>
              </div>

              {/* Top 3 Goleadores del Ciclo / Trayectoria Global (Estilo Torneos) */}
              {tecnico.top_scorers && tecnico.top_scorers.length > 0 && (
                <div className="mt-8 pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-800/30 p-6 rounded-[32px] border border-zinc-700/40">
                  <div className="flex flex-col items-center md:items-start">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center italic mb-1">
                      <Star size={14} className="mr-2 text-yellow-500 fill-yellow-500" />
                      {activeCiclo ? `Artilleros del Ciclo #${activeCiclo.numero_ciclo}` : "Artilleros de la Trayectoria"}
                    </h3>
                    <p className="text-xs font-bold text-zinc-400">
                      {activeCiclo ? `Top 3 máximos goleadores durante esta etapa` : `Top 3 goleadores acumulados en todos sus ciclos`}
                    </p>
                  </div>

                  <div className="flex items-center -space-x-4 hover:space-x-3 transition-all duration-500">
                    {tecnico.top_scorers.map((scorer, idx) => (
                      <Link 
                        key={scorer.pl_id} 
                        href={`/jugadores/${scorer.pl_id}`}
                        className="group relative"
                        title={scorer.name}
                      >
                        <div 
                          className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-zinc-900 bg-zinc-800 shadow-2xl group-hover:scale-110 group-hover:z-30 transition-all duration-500 relative ring-4 ring-transparent group-hover:ring-red-600/50 ${
                            idx === 0 ? 'z-20 ring-yellow-500/30' : idx === 1 ? 'z-10' : 'z-0'
                          }`}
                        >
                          {scorer.pl_foto ? (
                            <Image 
                              src={sanitizeImageUrl(scorer.pl_foto)} 
                              alt={scorer.name}
                              fill
                              unoptimized
                              className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                              <UserRound size={32} />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 px-1">
                            <span className="text-[9px] font-black text-white uppercase tracking-tighter text-center leading-none italic truncate">
                              {scorer.name.split(',')[0]}
                            </span>
                          </div>
                        </div>
                        
                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-zinc-900 shadow-xl z-40 transform group-hover:scale-110 transition-transform">
                          {scorer.goals} <span className="text-[7px] ml-0.5 opacity-70">GOLS</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Columna Izquierda: Historial de Partidos */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic flex items-center">
                <Calendar className="mr-3 text-red-600" size={24} />
                Historial de Partidos
              </h2>
              <div className="h-px flex-1 bg-zinc-200 ml-8" />
            </div>

            <div className="relative">
              <div className={`${tecnico.is_premium_restricted ? 'mask-fade-bottom' : ''}`}>
                <TecnicoMatches partidos={tecnico.partidos || []} itemsPerPage={15} />
              </div>

              {/* Premium Restriction for Matches */}
              {tecnico.is_premium_restricted && (
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end h-64 bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent pb-8">
                  <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-zinc-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Lock size={28} />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-2 uppercase italic">Historial Restringido</h3>
                    <p className="text-zinc-500 text-sm mb-8 font-medium leading-relaxed">
                      Estás viendo una versión limitada del archivo. 
                      Los socios <span className="text-zinc-900 font-black">Premium</span> acceden a los {tecnico.partidos_count} encuentros históricos disputados bajo esta conducción.
                    </p>
                    <Link href="/premium" className="bg-zinc-900 text-white w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center">
                      <Star className="mr-2 fill-yellow-400 text-yellow-400" size={14} />
                      Desbloquear Todo el Historial
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Resumen y Métricas */}
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

                <h3 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-red-500 italic">
                  {activeCiclo ? `Resumen Ciclo #${activeCiclo.numero_ciclo}` : "Resumen Global"}
                </h3>
                
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
            <p className="text-zinc-500 font-medium uppercase text-xs tracking-widest">
              {activeCiclo 
                ? `Distribución de goles durante el Ciclo #${activeCiclo.numero_ciclo}` 
                : "Distribución de goles a lo largo de toda la trayectoria."}
            </p>
          </div>

          <div className="relative">
            {!isPremium && (
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center p-8 text-center rounded-[48px] border-2 border-dashed border-red-200">
                <Shield size={48} className="text-red-600 mb-4" />
                <h4 className="font-black text-zinc-900 uppercase tracking-tighter text-3xl mb-4 italic">Análisis Exclusivo para Socios</h4>
                <p className="text-zinc-500 text-lg font-medium mb-10 max-w-md">
                  El desglose por tiempo y método de definición está disponible solo para socios Premium.
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
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] bg-red-500/10 px-3 py-1 rounded-full w-fit mb-2">
                          {activeCiclo ? `Artilleros del Ciclo #${activeCiclo.numero_ciclo}` : "Artilleros Históricos"}
                        </span>
                        <h4 className="text-2xl font-black tracking-tight text-white">Máximos Goleadores</h4>
                      </div>
                      <div className="flex items-center text-zinc-400">
                        <Award size={16} className="mr-2 text-yellow-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {activeCiclo ? `Podio Ciclo #${activeCiclo.numero_ciclo}` : "Podio Histórico"}
                        </span>
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
