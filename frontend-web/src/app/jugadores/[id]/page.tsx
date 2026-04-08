import { formatLocalDate } from "@/utils/date";
import { ChevronLeft, Trophy, Star, TrendingUp, Calendar, Hash, Timer, Target, Shield, Zap, Activity, ChevronRight, Flame, Lock } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";
import Image from "next/image";
import { cookies } from "next/headers";
import { sanitizeImageUrl } from "@/utils/image";
import PlayerGoalsAnalysis from "@/components/player/PlayerGoalsAnalysis";
import PlayerGoalMethodAnalysis from "@/components/player/PlayerGoalMethodAnalysis";

interface Gol {
  gol_fecha: string;
  minutos: number;
  tipo_gol_desc?: string;
  periodo_desc?: string;
  partido?: {
    go_ri: number;
    go_ad: number;
    rival: {
      ri_desc: string;
      escudo?: string;
    };
  };
}

interface Hito {
  fecha: string;
  goles_count: number;
  rival: string;
  rival_escudo?: string | null;
}

interface Jugador {
  pl_id: number;
  pl_apno: string;
  pl_foto?: string | null;
  goles_count: number;
  dias_desde_ultimo_gol?: number | null;
  partidos_desde_ultimo_gol?: number | null;
  goles_por_periodo?: Record<string, any>;
  goles_por_tipo?: { label: string; value: number }[];
  dobletes_count: number;
  hat_tricks_count: number;
  dobletes: Hito[];
  hat_tricks: Hito[];
  goles: Gol[];
  goles_meta?: {
    current_page: number;
    last_page: number;
    total: number;
  } | null;
  is_premium_restricted?: boolean;
}

export default async function JugadorDetailPage({
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

  let jugador: Jugador | null = null;
  try {
    const response = await customInstance<{ data: Jugador }>({
      url: `/v1/jugadores/${id}`,
      method: "GET",
      params: { page: currentPage },
      ...fetchOptions
    });
    jugador = response.data;
  } catch (error) {
    console.error("Error fetching jugador:", error);
  }

  if (!jugador) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
          <Star size={40} />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 uppercase italic tracking-tighter">Jugador no encontrado</h1>
        <Link href="/jugadores" className="text-red-600 font-black uppercase text-xs tracking-widest hover:underline mt-8 inline-block">
          Volver al archivo completo
        </Link>
      </div>
    );
  }

  const jugadorFotoUrl = sanitizeImageUrl(jugador.pl_foto);

  return (
    <div className="min-h-screen bg-zinc-50/30 pb-24">
      {/* Navigation & Header Area */}
      <div className="bg-white border-b border-zinc-100 mb-12">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Link href="/jugadores" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-[10px] uppercase tracking-[0.2em] mb-0 transition-colors group">
            <ChevronLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver al archivo histórico
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Profile - Estética Data Console */}
        <section className="bg-zinc-900 rounded-[48px] p-8 md:p-16 shadow-2xl relative overflow-hidden mb-16 border-4 border-white">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Trophy size={320} className="text-white" />
          </div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-red-600/20 blur-[100px] rounded-full" />
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            {/* Foto / Avatar */}
            <div className="relative">
              <div className="w-48 h-64 md:w-64 md:h-80 bg-zinc-800 rounded-[32px] flex items-center justify-center text-zinc-700 font-black text-8xl shadow-2xl border-2 border-zinc-700 overflow-hidden relative group">
                {jugadorFotoUrl ? (
                  <>
                    <Image 
                      src={jugadorFotoUrl} 
                      alt="" 
                      fill 
                      unoptimized
                      className={`object-cover object-top transition-all duration-700 ${!isPremium ? 'blur-2xl grayscale scale-110' : 'group-hover:scale-105'}`} 
                    />
                    {!isPremium && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="flex flex-col items-center px-6 text-center">
                          <Shield size={24} className="text-red-500 mb-2" />
                          <span className="text-[10px] text-white font-black uppercase tracking-widest leading-tight">Contenido<br/>Premium</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="leading-none">{jugador.pl_apno.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-xl border-4 border-zinc-900">
                <Star size={24} className="fill-current" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20">River Plate</span>
                <span className="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-700">Registro ID: {jugador.pl_id}</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-10 italic">
                {jugador.pl_apno}
              </h1>
              
              {/* Data Console Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Goles Totales</span>
                  </div>
                  <span className="block text-4xl font-black text-white tabular-nums">{jugador.goles_count}</span>
                </div>

                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Vigencia (Días)</span>
                  </div>
                  <span className="block text-4xl font-black text-white tabular-nums">
                    {jugador.dias_desde_ultimo_gol ?? "-"}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Días desde su último gol</span>
                </div>

                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Sequía (Partidos)</span>
                  </div>
                  <span className="block text-4xl font-black text-white tabular-nums">
                    {jugador.partidos_desde_ultimo_gol ?? "-"}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Partidos de River sin convertir</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hitos Goleadores Section - Restricted to Premium */}
        {(jugador.dobletes_count > 0 || jugador.hat_tricks_count > 0) && (
          <section className="mb-16 relative">
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
                <Trophy size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">Hall de Hitos</h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Partidos con múltiples anotaciones</p>
              </div>
            </div>

            <div className="relative">
              {!isPremium && (
                <div className="absolute inset-0 z-20 backdrop-blur-xl bg-white/40 flex flex-col items-center justify-center p-12 text-center rounded-[48px] border-4 border-dashed border-red-100 shadow-2xl shadow-red-900/5">
                  <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-3">
                    <Shield size={40} className="text-white" />
                  </div>
                  <h4 className="font-black text-zinc-900 uppercase tracking-tighter text-4xl mb-4 italic">Estadísticas Exclusivas</h4>
                  <p className="text-zinc-500 text-lg font-medium mb-10 max-w-md leading-relaxed">
                    El registro detallado de <span className="text-zinc-900 font-bold">Dobletes y Hat-tricks</span> históricos está reservado para nuestros socios Premium.
                  </p>
                  <Link href="/premium" className="bg-zinc-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-2xl hover:scale-105 active:scale-95">
                    Desbloquear Ahora
                  </Link>
                </div>
              )}

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${!isPremium ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
                {/* Hat-Tricks Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center">
                      <Flame size={14} className="mr-2 text-red-600" />
                      Hat-Tricks & Más
                    </span>
                    <span className="bg-zinc-100 text-zinc-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tabular-nums border border-zinc-200">
                      {jugador.hat_tricks_count} Totales
                    </span>
                  </div>
                  
                  {jugador.hat_tricks_count > 0 ? (
                    <div className="space-y-3">
                      {jugador.hat_tricks.map((hito, idx) => (
                        <div key={idx} className="bg-zinc-900 p-4 rounded-[32px] flex items-center justify-between border-2 border-transparent hover:border-red-600 transition-all group overflow-hidden relative shadow-xl">
                          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                            <Trophy size={64} className="text-white" />
                          </div>
                          <div className="flex items-center space-x-4 relative z-10">
                            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                              {hito.rival_escudo ? (
                                <Image 
                                  src={sanitizeImageUrl(hito.rival_escudo)} 
                                  alt="" 
                                  width={32} 
                                  height={32} 
                                  unoptimized
                                  className="object-contain p-1" 
                                />
                              ) : (
                                <Target size={20} className="text-zinc-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{formatLocalDate(hito.fecha)}</span>
                              </div>
                              <h4 className="font-black text-white text-md uppercase tracking-tight group-hover:text-red-500 transition-colors">
                                vs {hito.rival}
                              </h4>
                            </div>
                          </div>
                          <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl italic shadow-lg shadow-red-900/40 relative z-10">
                            {hito.goles_count}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[32px] p-8 text-center">
                      <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Sin Hat-Tricks registrados</p>
                    </div>
                  )}
                </div>

                {/* Dobletes Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center">
                      <Star size={14} className="mr-2 text-red-600" />
                      Dobletes
                    </span>
                    <span className="bg-zinc-100 text-zinc-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tabular-nums border border-zinc-200">
                      {jugador.dobletes_count} Totales
                    </span>
                  </div>
                  
                  {jugador.dobletes_count > 0 ? (
                    <div className="space-y-3">
                      {jugador.dobletes.map((hito, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-[32px] flex items-center justify-between border border-zinc-100 hover:border-red-600 transition-all group shadow-sm">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                              {hito.rival_escudo ? (
                                <Image 
                                  src={sanitizeImageUrl(hito.rival_escudo)} 
                                  alt="" 
                                  width={32} 
                                  height={32} 
                                  unoptimized
                                  className="object-contain p-1" 
                                />
                              ) : (
                                <Target size={20} className="text-zinc-200" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{formatLocalDate(hito.fecha)}</span>
                              </div>
                              <h4 className="font-black text-zinc-900 text-md uppercase tracking-tight group-hover:text-red-600 transition-colors">
                                vs {hito.rival}
                              </h4>
                            </div>
                          </div>
                          <div className="bg-zinc-100 text-zinc-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg italic border border-zinc-200">
                            {hito.goles_count}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[32px] p-8 text-center">
                      <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Sin Dobletes registrados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Main Content: History */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic flex items-center">
                <Star className="mr-4 text-red-600 fill-red-600" size={24} />
                Historial de Goles
              </h2>
              <div className="flex flex-col items-end">
                <span className="text-zinc-400 font-black text-[10px] uppercase tracking-widest mb-1">
                  Página {jugador.goles_meta?.current_page || 1} de {jugador.goles_meta?.last_page || 1}
                </span>
                {jugador.is_premium_restricted && (
                  <span className="bg-zinc-100 text-zinc-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-200">
                    Vista Limitada
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {jugador.goles.map((gol, index) => {
                // Cálculo del número de gol descendente (ej: Gol #12, #11...)
                const currentPage = jugador.goles_meta?.current_page || 1;
                const totalGoals = jugador.goles_count;
                const globalGoalNumber = totalGoals - ((currentPage - 1) * 10 + index);

                return (
                  <div key={index} className="bg-white p-6 rounded-[40px] border border-zinc-100 flex items-center justify-between shadow-sm group hover:border-red-600 transition-all duration-300">
                    <div className="flex items-center space-x-6">
                      {/* Rival Crest Placeholder */}
                      <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center border border-zinc-100 shadow-inner group-hover:scale-110 transition-transform overflow-hidden relative">
                        {gol.partido?.rival?.escudo ? (
                          <Image 
                            src={sanitizeImageUrl(gol.partido.rival.escudo)} 
                            alt="" 
                            fill 
                            unoptimized
                            className="object-contain p-2" 
                          />
                        ) : (
                          <Trophy size={24} className="text-zinc-200" />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Gol #{globalGoalNumber}</span>
                          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{formatLocalDate(gol.gol_fecha)}</span>
                        </div>
                        <h4 className="font-black text-zinc-900 text-lg uppercase tracking-tight group-hover:text-red-600 transition-colors">
                          vs {gol.partido?.rival?.ri_desc || "Rival Desconocido"}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            gol.partido && gol.partido.go_ri > gol.partido.go_ad ? "bg-green-100 text-green-700" : 
                            gol.partido && gol.partido.go_ri < gol.partido.go_ad ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-700"
                          }`}>
                            {gol.partido ? `${gol.partido.go_ri} - ${gol.partido.go_ad}` : "N/D"}
                          </div>
                          {gol.tipo_gol_desc && (
                            <span className="text-[9px] font-black text-yellow-600 uppercase tracking-[0.2em]">• {gol.tipo_gol_desc}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-2 text-zinc-900">
                        <span className="text-3xl font-black tabular-nums">{gol.minutos}<span className="text-sm ml-0.5">'</span></span>
                        <Timer size={18} className="text-red-600" />
                      </div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                        {gol.periodo_desc || "Tiempo Regular"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Paginación */}
              {jugador.goles_meta && jugador.goles_meta.last_page > 1 && !jugador.is_premium_restricted && (
                <div className="flex justify-center items-center space-x-2 mt-12 py-8">
                  {currentPage > 1 ? (
                    <Link 
                      href={`/jugadores/${id}?page=${currentPage - 1}`}
                      className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-600 font-black text-xs uppercase tracking-widest hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
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
                      Página {currentPage} de {jugador.goles_meta.last_page}
                    </span>
                  </div>

                  {currentPage < jugador.goles_meta.last_page ? (
                    <Link 
                      href={`/jugadores/${id}?page=${currentPage + 1}`}
                      className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-600 font-black text-xs uppercase tracking-widest hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
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

              {jugador.is_premium_restricted && (
                <div className="mt-8 relative overflow-hidden rounded-[48px] border-4 border-white shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black opacity-95" />
                  <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
                    <Shield size={200} className="text-white" />
                  </div>

                  <div className="relative z-10 p-12 text-center">
                    <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-900/40 rotate-3">
                      <Star size={40} className="text-white fill-white" />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                      Desbloquea el Historial Completo
                    </h3>
                    <p className="text-zinc-400 font-medium mb-10 max-w-md mx-auto leading-relaxed">
                      Estás viendo una versión limitada del archivo. Los socios <span className="text-white font-bold">Premium</span> acceden al registro histórico de todos los goles de cada ídolo.
                    </p>
                    <Link 
                      href="/premium" 
                      className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all shadow-xl hover:scale-105 inline-block"
                    >
                      Hacerme Premium Ahora
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Resumen Info - Restricted to Premium */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden border-4 border-white min-h-[500px] flex flex-col">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Activity size={120} />
              </div>

              {!isPremium && (
                <div className="absolute inset-0 z-30 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                    <Lock size={28} className="text-red-500" />
                  </div>
                  <h4 className="text-white font-black uppercase tracking-tighter text-xl mb-3 italic">Análisis de Carrera</h4>
                  <p className="text-zinc-300 text-[10px] font-medium mb-8 leading-relaxed uppercase tracking-wider">
                    Desbloquea métricas de eficiencia, <span className="text-white font-bold">hitos históricos</span> y proyecciones exclusivas para socios.
                  </p>
                  <Link href="/premium" className="bg-red-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-2xl hover:scale-105 active:scale-95">
                    Hacerme Premium
                  </Link>
                </div>
              )}

              <div className={!isPremium ? "opacity-20 grayscale pointer-events-none blur-sm" : ""}>
                <h3 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-red-500 italic">Resumen de Carrera</h3>

                <div className="space-y-8 relative z-10">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-3 tracking-widest opacity-60">
                      <span>Goles Totales</span>
                      <span>{jugador.goles_count}</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <div className="h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: '100%' }} />
                    </div>
                  </div>

                  {/* Additional Sidebar Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                    <div>
                      <span className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Hat-Tricks</span>
                      <span className="text-2xl font-black italic">{jugador.hat_tricks_count}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Dobletes</span>
                      <span className="text-2xl font-black italic">{jugador.dobletes_count}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-white/10">
                  <p className="text-xs font-medium text-zinc-400 mb-8 leading-relaxed uppercase tracking-tight">
                    Este jugador representa una pieza clave de la efectividad histórica del club en su posición.
                  </p>

                  <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer">
                    <Target className="text-red-500 mb-4" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Eficiencia de Remate</p>
                    <p className="text-xl font-black text-white italic tracking-tighter uppercase">Análisis Proyectado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Analytics Section - Full Width, matching Partidos style */}
        <section className="mt-20">
          <div className="flex flex-col mb-10">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight uppercase italic">Analítica de Resultados</h2>
            <p className="text-zinc-500 font-medium uppercase text-xs tracking-widest">Distribución de goles y efectividad por periodos.</p>
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
                  data={jugador.goles_por_periodo || {}} 
                  total={jugador.goles_count} 
                />
                <PlayerGoalMethodAnalysis 
                  data={jugador.goles_por_tipo || []} 
                  total={jugador.goles_count} 
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
