import { MapPin, Target, TrendingUp, Calendar, Zap, Star, Award, Shield, Percent, Activity, Users, ShieldAlert, Lock, Landmark, History, Clock, Timer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { customInstance } from "@/api/custom-instance";
import { cookies } from "next/headers";
import GoBack from "@/components/GoBack";
import AccessControl from "@/components/AccessControl";
import GoalsAnalysis from "@/components/GoalsAnalysis";
import GoalMethodAnalysis from "@/components/GoalMethodAnalysis";
import RiverOfficialShield from "@/components/RiverOfficialShield";
import EstadioMatches from "@/components/EstadioMatches";
import ClubShield from "@/components/ClubShield";

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
  };
  fase?: {
    fa_desc: string;
  };
  condicion?: {
    co_desc: string;
  };
}

interface Streak {
  count: number;
  start_date: string;
  end_date: string;
  duration_days: number;
  is_vigente: boolean;
  days_since_end: number;
}

interface HitoMatch {
  fecha: string;
  torneo: string;
  condicion: string;
  rival: string;
  escudo_url?: string | null;
  resultado: string;
  dias_transcurridos: number;
}

interface Estadio {
  es_id: number;
  es_desc: string;
  river_shield?: string | null;
  is_premium_restricted: boolean;
  stats: {
    pj: number;
    pg: number;
    pe: number;
    pp: number;
    gf: number;
    gc: number;
    dg: number;
    puntos: number;
    vallas_invictas: number;
    efectividad: number;
  };
  top_scorers?: Array<{
    pl_id: number;
    pl_apno: string;
    pl_foto: string | null;
    goals_count: number;
  }>;
  streaks: {
    invincibility: Streak | null;
    drought: Streak | null;
  };
  last_won_match: HitoMatch | null;
  last_lost_match: HitoMatch | null;
  goles_por_periodo?: any[];
  goles_por_tipo?: any[];
  partidos: Partido[];
}

export default async function EstadioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const userRole = cookieStore.get("user_role")?.value;
  const isLoggedIn = !!token;
  const isPremium = userRole === "premium";
  
  const currentTier: "guest" | "registered" | "premium" = isPremium ? "premium" : (isLoggedIn ? "registered" : "guest");
  
  const fetchOptions = { headers: token ? { "Authorization": `Bearer ${token}` } : {} } as any;

  let estadio: Estadio | null = null;
  try {
    const response = await customInstance<{ data: Estadio }>({
      url: `/v1/estadios/${id}`,
      method: "GET",
      ...fetchOptions
    });
    estadio = response.data;
  } catch (error) {
    console.error("Error fetching estadio:", error);
  }

  if (!estadio) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic">Estadio no encontrado</h1>
        <Link href="/estadios" className="text-red-600 font-bold hover:underline mt-4 inline-block uppercase text-xs tracking-widest">
          Volver a estadios
        </Link>
      </div>
    );
  }

  const stats = estadio.stats;
  const partidos = estadio.partidos || [];
  
  // Semaphore: last 20 matches chronological (oldest to newest)
  const last20Matches = [...partidos].slice(0, 20).reverse();

  const formatStreakDate = (date: string) => {
    return new Date(date + 'T12:00:00').toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getTimeSince = (days: number) => {
    if (days < 30) return `${Math.floor(days)} DÍAS`;
    if (days < 365) return `${Math.floor(days / 30)} MESES`;
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? 'AÑO' : 'AÑOS'}`;
  };

  const isMonumental = estadio.es_id === 2 || estadio.es_desc.includes("MONUMENTAL");

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <GoBack href="/estadios" label="Archivo de Estadios" />

        {/* Hero Section */}
        <section className="bg-zinc-900 rounded-[48px] border border-zinc-800 p-8 md:p-10 shadow-2xl shadow-zinc-950/50 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none rotate-12 text-white">
            <Landmark size={400} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-24 h-24 md:w-28 md:h-28 relative group shrink-0">
                  <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative z-10 w-full h-full flex items-center justify-center p-4 bg-zinc-800/80 backdrop-blur-xl rounded-3xl border border-zinc-700 shadow-2xl">
                    <MapPin className="text-red-500 w-12 h-12 md:w-14 md:h-14" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="bg-red-600/10 text-red-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20">
                      {isMonumental ? "Nuestra Casa" : "Sede Oficial"}
                    </span>
                    <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-700">
                      {stats.pj} Partidos
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight italic">
                    {estadio.es_desc}
                  </h1>
                </div>
              </div>

              {/* Top Scorers in this Stadium */}
              {estadio.top_scorers && estadio.top_scorers.length > 0 && (
                <div className="flex flex-col items-center md:items-end shrink-0">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center italic">
                    <Star size={14} className="mr-2 text-yellow-500 fill-yellow-500" /> Artilleros en esta Sede
                  </h3>
                  <div className="flex items-center -space-x-4 hover:space-x-2 transition-all duration-700">
                    {estadio.top_scorers.map((scorer, idx) => (
                      <Link 
                        key={scorer.pl_id} 
                        href={`/jugadores/${scorer.pl_id}`}
                        className="group relative"
                        title={scorer.pl_apno}
                      >
                        <div 
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-900 bg-zinc-800 shadow-2xl group-hover:scale-110 group-hover:z-30 transition-all duration-500 relative ring-2 ring-transparent group-hover:ring-red-600/50 ${
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
                              <Users size={24} />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 px-1">
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter text-center leading-none italic">
                              {scorer.pl_apno.split(',')[0]}
                            </span>
                          </div>
                        </div>
                        
                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full border border-zinc-900 shadow-xl z-40 transform group-hover:scale-110 transition-transform">
                          {scorer.goals_count} <span className="text-[6px] opacity-70 italic">GOLES</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: 'PJ', value: stats.pj, icon: Activity, color: 'zinc', bg: 'bg-zinc-800/50' },
                { label: 'PG', value: stats.pg, icon: Zap, color: 'emerald', bg: 'bg-emerald-950/20' },
                { label: 'PE', value: stats.pe, icon: Shield, color: 'blue', bg: 'bg-blue-950/20' },
                { label: 'PP', value: stats.pp, icon: ShieldAlert, color: 'red', bg: 'bg-red-950/20' },
                { label: 'GF', value: stats.gf, icon: Target, color: 'zinc', bg: 'bg-zinc-800/50' },
                { label: 'GC', value: stats.gc, icon: ShieldAlert, color: 'zinc', bg: 'bg-zinc-800/50' },
                { label: 'DG', value: stats.dg, icon: TrendingUp, color: 'zinc', bg: 'bg-zinc-800/50', prefix: stats.dg > 0 ? '+' : '' },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} p-6 rounded-[32px] text-center border border-white/5 hover:border-white/10 hover:bg-zinc-800 transition-all group shadow-xl`}>
                  <item.icon size={14} className={`mx-auto mb-3 text-${item.color}-500 opacity-40 group-hover:opacity-100 transition-opacity`} />
                  <span className={`block text-3xl font-black text-white mb-1 tabular-nums tracking-tighter`}>{item.prefix}{item.value}</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Feature Stats Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-950 rounded-[40px] p-8 flex items-center justify-between text-white group overflow-hidden relative border border-white/5 shadow-2xl lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Percent className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-red-600/20 transition-colors" size={160} />
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Efectividad en Sede</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic tracking-tighter">{stats.efectividad}%</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-transform relative z-10">
                  <TrendingUp size={24} />
                </div>
              </div>

              {/* Última Victoria */}
              <div className="bg-zinc-800/30 backdrop-blur-md rounded-[40px] p-8 flex items-center justify-between border border-white/5 group shadow-xl lg:col-span-1 relative">
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Última Victoria</span>
                  {estadio.last_won_match ? (
                    <div className="flex flex-col group/hito">
                      <span className="text-3xl font-black text-emerald-500 italic tracking-tighter cursor-help">
                        {new Date(estadio.last_won_match.fecha + 'T12:00:00').getFullYear()}
                      </span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-zinc-950 p-5 rounded-[32px] shadow-2xl opacity-0 invisible group-hover/hito:opacity-100 group-hover/hito:visible transition-all z-50 border border-zinc-800 pointer-events-none">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{formatStreakDate(estadio.last_won_match.fecha)}</span>
                          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{estadio.last_won_match.resultado}</span>
                        </div>
                        <div className="flex items-center space-x-3 mb-3">
                          <ClubShield src={estadio.last_won_match.escudo_url || undefined} className="w-6 h-6" />
                          <span className="text-[10px] font-black text-white uppercase italic truncate">vs {estadio.last_won_match.rival}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter line-clamp-1">🏆 {estadio.last_won_match.torneo}</p>
                          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">📍 {estadio.last_won_match.condicion}</p>
                          <p className="text-[9px] font-black text-emerald-500 uppercase mt-2 pt-2 border-t border-white/5">Hace {getTimeSince(estadio.last_won_match.dias_transcurridos)}</p>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950 rotate-45 -mt-1.5 border-r border-b border-zinc-800" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xl font-black text-zinc-600 italic">NUNCA</span>
                  )}
                </div>
                <div className="w-14 h-14 bg-emerald-950/40 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-all shadow-xl group-hover:scale-110">
                  <Zap size={24} />
                </div>
              </div>

              {/* Última Derrota */}
              <div className="bg-zinc-800/30 backdrop-blur-md rounded-[40px] p-8 flex items-center justify-between border border-white/5 group shadow-xl lg:col-span-1 relative">
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Última Derrota</span>
                  {estadio.last_lost_match ? (
                    <div className="flex flex-col group/hito">
                      <span className="text-3xl font-black text-red-500 italic tracking-tighter cursor-help">
                        {new Date(estadio.last_lost_match.fecha + 'T12:00:00').getFullYear()}
                      </span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-zinc-950 p-5 rounded-[32px] shadow-2xl opacity-0 invisible group-hover/hito:opacity-100 group-hover/hito:visible transition-all z-50 border border-zinc-800 pointer-events-none">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{formatStreakDate(estadio.last_lost_match.fecha)}</span>
                          <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">{estadio.last_lost_match.resultado}</span>
                        </div>
                        <div className="flex items-center space-x-3 mb-3">
                          <ClubShield src={estadio.last_lost_match.escudo_url || undefined} className="w-6 h-6" />
                          <span className="text-[10px] font-black text-white uppercase italic truncate">vs {estadio.last_lost_match.rival}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter line-clamp-1">🏆 {estadio.last_lost_match.torneo}</p>
                          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">📍 {estadio.last_lost_match.condicion}</p>
                          <p className="text-[9px] font-black text-red-500 uppercase mt-2 pt-2 border-t border-white/5">Hace {getTimeSince(estadio.last_lost_match.dias_transcurridos)}</p>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950 rotate-45 -mt-1.5 border-r border-b border-zinc-800" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xl font-black text-zinc-600 italic">NUNCA</span>
                  )}
                </div>
                <div className="w-14 h-14 bg-red-950/40 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20 group-hover:bg-red-500 group-hover:text-red-950 transition-all shadow-xl group-hover:scale-110">
                  <ShieldAlert size={24} />
                </div>
              </div>

              <div className="bg-zinc-800/30 backdrop-blur-md rounded-[40px] p-8 flex items-center justify-between border border-white/5 group shadow-xl lg:col-span-1">
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Vallas Invictas</span>
                  <span className="text-4xl font-black text-white italic tracking-tighter">{stats.vallas_invictas}</span>
                </div>
                <div className="w-14 h-14 bg-zinc-900 text-zinc-400 rounded-2xl flex items-center justify-center border border-zinc-700 group-hover:bg-white group-hover:text-zinc-900 group-hover:border-white transition-all shadow-xl group-hover:scale-110">
                  <Shield size={24} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Match History */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic flex items-center">
                <Calendar className="mr-3 text-red-600" size={24} />
                Historial de Partidos
              </h2>
              <div className="h-px flex-1 bg-zinc-200 ml-8" />
            </div>

            <div className="relative">
              <div className={`${estadio.is_premium_restricted ? 'mask-fade-bottom' : ''}`}>
                <EstadioMatches partidos={partidos} itemsPerPage={15} />
              </div>

              {/* Premium Restriction for Matches */}
              {estadio.is_premium_restricted && (
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end h-64 bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent pb-8">
                  <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-zinc-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Lock size={28} />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-2 uppercase italic">Historial Restringido</h3>
                    <p className="text-zinc-500 text-sm mb-8 font-medium leading-relaxed">
                      Estás viendo una versión limitada del archivo. 
                      Los socios <span className="text-zinc-900 font-black">Premium</span> acceden a los {stats.pj} encuentros históricos disputados en esta sede.
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

          {/* Right Column: Performance Console Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
                <Activity size={20} />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic">
                Consola de <span className="text-red-600">Rendimiento</span>
              </h2>
            </div>

            <div className="bg-zinc-900 rounded-[48px] p-8 text-white relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[48px] pointer-events-none" />
              
              {/* Goal Balance */}
              <div className="mb-12 relative z-10">
                <div className="flex items-center space-x-3 mb-8">
                  <Target className="text-red-500" size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Producción de Goles</span>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                      <span className="text-zinc-400 group-hover:text-red-500 transition-colors italic">A Favor (CARP)</span>
                      <span className="text-white text-lg tabular-nums italic">{stats.gf}</span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-red-600 rounded-full shadow-lg shadow-red-900/40" style={{ width: `${stats.gf + stats.gc > 0 ? (stats.gf / (stats.gf + stats.gc)) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                      <span className="text-zinc-400 group-hover:text-white transition-colors italic">En Contra</span>
                      <span className="text-white text-lg tabular-nums italic">{stats.gc}</span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-zinc-600 rounded-full" style={{ width: `${stats.gf + stats.gc > 0 ? (stats.gc / (stats.gf + stats.gc)) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Semaphore / Form Guide Section */}
              <div className="mb-12 pt-8 border-t border-white/5 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={14} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Racha Reciente</span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">Últimos {last20Matches.length}</span>
                </div>

                <div className="relative">
                  <div className={`flex flex-wrap gap-2 ${!isPremium ? 'blur-sm grayscale opacity-40 pointer-events-none' : ''}`}>
                    {last20Matches.map((p, idx) => {
                      const isLeft = idx % 7 < 2;
                      const isRight = idx % 7 >= 5;
                      const tooltipAlign = isLeft 
                        ? 'left-0 translate-x-0' 
                        : isRight 
                        ? 'right-0 left-auto translate-x-0' 
                        : 'left-1/2 -translate-x-1/2';
                      const arrowAlign = isLeft 
                        ? 'left-3.5 -translate-x-1/2' 
                        : isRight 
                        ? 'right-3.5 translate-x-1/2' 
                        : 'left-1/2 -translate-x-1/2';

                      return (
                        <div key={idx} className="relative group/match">
                          <div 
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-110 cursor-help ${
                              p.resultado === 'G' ? 'bg-emerald-500 text-emerald-950 shadow-emerald-900/20' : 
                              p.resultado === 'P' ? 'bg-red-500 text-white shadow-red-900/20' : 
                              'bg-zinc-500 text-zinc-950 shadow-zinc-900/20'
                            }`}
                          >
                            {p.resultado}
                          </div>

                          {/* Advanced Tooltip matching Rivales style */}
                          <div className={`absolute bottom-full mb-3 w-52 bg-zinc-800 p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover/match:opacity-100 group-hover/match:visible transition-all z-50 border border-zinc-700 pointer-events-none ${tooltipAlign}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[8px] font-black text-zinc-400 uppercase">
                                {new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                p.resultado === 'G' ? 'bg-green-500/20 text-green-400' :
                                p.resultado === 'P' ? 'bg-red-500/20 text-red-400' :
                                'bg-zinc-500/20 text-zinc-400'
                              }`}>
                                {p.goles_river} - {p.goles_rival}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <ClubShield src={p.rival?.escudo_url || undefined} className="w-6 h-6 shrink-0" />
                              <span className="text-xs font-black text-white truncate uppercase italic">{p.rival?.ri_desc || 'Rival'}</span>
                            </div>
                            <p className="mt-2 text-[7px] font-bold text-zinc-400 uppercase tracking-tighter truncate">{p.torneo?.tor_desc}</p>
                            {/* Arrow */}
                            <div className={`absolute top-full w-2 h-2 bg-zinc-800 rotate-45 -mt-1 border-r border-b border-zinc-700 ${arrowAlign}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!isPremium && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <Lock size={16} className="text-red-500 mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-tighter text-white mb-3">Contenido Premium</p>
                      <Link href="/premium" className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors">
                        Desbloquear
                      </Link>
                    </div>
                  )}
                </div>

                <p className="mt-6 text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Secuencia cronológica (Izquierda: antiguo • <span className="text-red-500">Derecha: reciente</span>)
                </p>
              </div>

              {/* Historical Streaks */}
              <div className="relative z-10 pt-8 border-t border-white/5">
                <div className="flex items-center space-x-3 mb-6">
                  <Timer className="text-red-500" size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Rachas Históricas en Sede</span>
                </div>

                <div className="space-y-4">
                  {/* Invincible Streak */}
                  <div className="relative group/inv">
                    <div className={`p-5 rounded-3xl bg-zinc-950/40 border border-white/5 flex items-center justify-between hover:border-emerald-500/20 transition-all ${!isPremium ? 'filter blur-[4px] select-none opacity-30' : ''}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                          <Zap size={18} />
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Mayor Invicto</span>
                          {estadio.streaks?.invincibility ? (
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-base font-black text-white italic tracking-tight">
                                  {estadio.streaks.invincibility.count} Partidos
                                </span>
                                {estadio.streaks.invincibility.is_vigente && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">
                                {formatStreakDate(estadio.streaks.invincibility.start_date)} - {formatStreakDate(estadio.streaks.invincibility.end_date)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-black text-zinc-600">---</span>
                          )}
                        </div>
                      </div>
                      
                      {estadio.streaks?.invincibility && (
                        <div className="text-right">
                          <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest block mb-1">
                            {estadio.streaks.invincibility.is_vigente ? 'Vigente' : `${Math.floor(estadio.streaks.invincibility.duration_days / 30)} Meses`}
                          </span>
                          {!estadio.streaks.invincibility.is_vigente && (
                            <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-tighter">
                              Hace {getTimeSince(estadio.streaks.invincibility.days_since_end)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drought Streak */}
                  <div className="relative group/dro">
                    <div className={`p-5 rounded-3xl bg-zinc-950/40 border border-white/5 flex items-center justify-between hover:border-red-500/20 transition-all ${!isPremium ? 'filter blur-[4px] select-none opacity-30' : ''}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                          <Clock size={18} />
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Mayor Sequía (Sin Ganar)</span>
                          {estadio.streaks?.drought ? (
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-base font-black text-white italic tracking-tight">
                                  {estadio.streaks.drought.count} Partidos
                                </span>
                                {estadio.streaks.drought.is_vigente && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">
                                {formatStreakDate(estadio.streaks.drought.start_date)} - {formatStreakDate(estadio.streaks.drought.end_date)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-black text-zinc-600">---</span>
                          )}
                        </div>
                      </div>
                      
                      {estadio.streaks?.drought && (
                        <div className="text-right">
                          <span className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest block mb-1">
                            {estadio.streaks.drought.is_vigente ? 'Vigente' : `${Math.floor(estadio.streaks.drought.duration_days / 30)} Meses`}
                          </span>
                          {!estadio.streaks.drought.is_vigente && (
                            <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-tighter">
                              Hace {getTimeSince(estadio.streaks.drought.days_since_end)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isPremium && (
                    <div className="mt-6 p-6 rounded-[32px] bg-gradient-to-b from-zinc-800/80 to-zinc-950 border border-yellow-500/20 text-center">
                      <Star className="text-yellow-400 mx-auto mb-2 fill-yellow-400" size={20} />
                      <h4 className="text-xs font-black uppercase text-white tracking-wider mb-1">Analítica de Rachas</h4>
                      <p className="text-[10px] text-zinc-400 mb-4 font-medium">Desbloquea el análisis temporal completo de invictos y sequías históricas.</p>
                      <Link href="/premium" className="inline-flex items-center justify-center px-4 py-2 bg-white text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors">
                        Ser Premium
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Goal Difference Summary */}
              <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 group-hover:border-red-600/20 transition-all relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <Award className="text-yellow-500" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Balance Diferencia</span>
                </div>
                <p className="text-xs font-medium text-zinc-400 leading-relaxed uppercase">
                  River Plate tiene una diferencia neta de <span className="text-white font-black italic">{stats.dg > 0 ? `+${stats.dg}` : stats.dg}</span> goles en esta sede en {stats.pj} partidos oficiales.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Analysis Section */}
        <section className="mt-20">
          <div className="flex flex-col mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight uppercase italic">Dinámica de Goles en esta Sede</h2>
            <p className="text-zinc-500 font-medium">Distribución de goles, efectividad por periodos y formas de definición a lo largo del historial.</p>
          </div>

          <div className="relative">
            {!isPremium && (
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center p-8 text-center rounded-[48px] border-2 border-dashed border-red-200">
                <Shield size={48} className="text-red-600 mb-4" />
                <h4 className="font-black text-zinc-900 uppercase tracking-tighter text-3xl mb-4 italic">Análisis Exclusivo para Socios</h4>
                <p className="text-zinc-500 text-lg font-medium mb-10 max-w-md">
                  El desglose por tiempo y método de definición del historial completo está disponible solo para socios Premium.
                </p>
                <Link href="/premium" className="bg-zinc-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                  Quiero ser Premium
                </Link>
              </div>
            )}

            <AccessControl tier={currentTier} requiredTier="premium" className={`rounded-[48px] overflow-hidden shadow-2xl border border-zinc-100 ${!isPremium ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="flex flex-col">
                <GoalsAnalysis filters={{ estadio: id }} />
                <GoalMethodAnalysis filters={{ estadio: id }} />
              </div>
            </AccessControl>
          </div>
        </section>
      </div>
    </div>
  );
}
