import { ShieldAlert, Target, TrendingUp, Calendar, Zap, Info, Star, Lock, Award, Shield, Percent, Activity, Users, Clock, History, Timer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { customInstance } from "@/api/custom-instance";
import { cookies } from "next/headers";
import GoBack from "@/components/GoBack";
import AccessControl from "@/components/AccessControl";
import GoalsAnalysis from "@/components/GoalsAnalysis";
import GoalMethodAnalysis from "@/components/GoalMethodAnalysis";
import RiverOfficialShield from "@/components/RiverOfficialShield";
import RivalMatches from "@/components/RivalMatches";
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
  resultado: string;
  dias_transcurridos: number;
}

interface Rival {
  ri_id: number;
  ri_desc: string;
  escudo_url?: string | null;
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
  partidos: Partido[];
}

export default async function RivalDetailPage({
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

  let rival: Rival | null = null;
  try {
    const response = await customInstance<{ data: Rival }>({
      url: `/v1/rivales/${id}`,
      method: 'GET',
      ...fetchOptions
    });
    rival = response.data;
  } catch (error) {
    console.error("Error fetching rival:", error);
  }

  if (!rival) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic">Rival no encontrado</h1>
        <Link href="/rivales" className="text-red-600 font-bold hover:underline mt-4 inline-block uppercase text-xs tracking-widest">Volver a rivales</Link>
      </div>
    );
  }

  const stats = rival.stats;
  const partidos = rival.partidos || [];
  
  // Logic for the last 20 matches semaphore
  // API sends them in descending order (newest first)
  const last20Matches = [...partidos].slice(0, 20).reverse(); // [oldest ... newest]

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

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <GoBack href="/rivales" label="Archivo de Rivales" />

        {/* Hero Head-to-Head */}
        <section className="bg-zinc-900 rounded-[48px] border border-zinc-800 p-8 md:p-10 shadow-2xl shadow-zinc-950/50 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none rotate-12 text-white">
            <ShieldAlert size={400} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-10">
               <div className="flex flex-col items-center flex-1 order-1">
                  <div className="w-24 h-24 md:w-32 md:h-32 relative mb-6 group">
                    <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <RiverOfficialShield className="w-full h-full drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]" />
                    </div>
                  </div>
                  <span className="bg-red-600/10 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20 mb-3">Anfitrión</span>
                  <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight italic text-center">
                    River <span className="text-red-600 underline decoration-red-600/30 underline-offset-8">Plate</span>
                  </h1>
               </div>
               
               <div className="flex flex-col items-center gap-4 order-2">
                  <div className="w-16 h-16 bg-white text-zinc-900 rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] border-4 border-zinc-900 rotate-3 transition-transform hover:rotate-0 duration-500">VS</div>
                  <div className="h-16 w-px bg-gradient-to-b from-zinc-700 to-transparent hidden md:block" />
               </div>

               <div className="flex flex-col items-center flex-1 order-3">
                  <div className="w-24 h-24 md:w-32 md:h-32 relative mb-6 group">
                    <div className="absolute inset-0 bg-white rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity" />
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-4 bg-zinc-800/50 backdrop-blur-xl rounded-full border border-zinc-700 group-hover:border-zinc-500 transition-all duration-500 shadow-2xl">
                      {rival.escudo_url ? (
                        <Image 
                          src={rival.escudo_url} 
                          alt={rival.ri_desc} 
                          width={100} 
                          height={100} 
                          className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <Shield size={60} className="text-zinc-700" />
                      )}
                    </div>
                  </div>
                  <span className="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-700 mb-3">Adversario</span>
                  <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight italic text-center">
                    {rival.ri_desc}
                  </h1>
               </div>

               {/* Top Scorers against this Rival */}
               {rival.top_scorers && rival.top_scorers.length > 0 && (
                  <div className="flex flex-col items-center md:items-end flex-1 order-4">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center italic">
                      <Star size={14} className="mr-2 text-yellow-500 fill-yellow-500" /> Artilleros Millonarios
                    </h3>
                    <div className="flex items-center -space-x-4 hover:space-x-2 transition-all duration-700">
                      {rival.top_scorers.map((scorer, idx) => (
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
            
            {/* Stats Dashboard */}
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

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="bg-zinc-950 rounded-[40px] p-8 flex items-center justify-between text-white group overflow-hidden relative border border-white/5 shadow-2xl lg:col-span-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Percent className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-red-600/20 transition-colors" size={160} />
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Efectividad Histórica</span>
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
                    {rival.last_won_match ? (
                      <div className="flex flex-col group/hito">
                        <span className="text-3xl font-black text-emerald-500 italic tracking-tighter cursor-help">
                          {new Date(rival.last_won_match.fecha + 'T12:00:00').getFullYear()}
                        </span>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-zinc-950 p-5 rounded-[32px] shadow-2xl opacity-0 invisible group-hover/hito:opacity-100 group-hover/hito:visible transition-all z-50 border border-zinc-800 pointer-events-none">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{formatStreakDate(rival.last_won_match.fecha)}</span>
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{rival.last_won_match.resultado}</span>
                            </div>
                            <div className="flex items-center space-x-3 mb-3">
                                <RiverOfficialShield className="w-6 h-6" />
                                <span className="text-[10px] font-black text-white uppercase italic">Victoria Millonaria</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter line-clamp-1">🏆 {rival.last_won_match.torneo}</p>
                                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">📍 {rival.last_won_match.condicion}</p>
                                <p className="text-[9px] font-black text-emerald-500 uppercase mt-2 pt-2 border-t border-white/5">Hace {getTimeSince(rival.last_won_match.dias_transcurridos)}</p>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950 rotate-45 -mt-1.5 border-r border-b border-zinc-800" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xl font-black text-zinc-600 italic">NUNCA</span>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-emerald-950/40 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-all shadow-xl group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
               </div>

               {/* Última Derrota */}
               <div className="bg-zinc-800/30 backdrop-blur-md rounded-[40px] p-8 flex items-center justify-between border border-white/5 group shadow-xl lg:col-span-1 relative">
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Última Derrota</span>
                    {rival.last_lost_match ? (
                      <div className="flex flex-col group/hito">
                        <span className="text-3xl font-black text-red-500 italic tracking-tighter cursor-help">
                          {new Date(rival.last_lost_match.fecha + 'T12:00:00').getFullYear()}
                        </span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-zinc-950 p-5 rounded-[32px] shadow-2xl opacity-0 invisible group-hover/hito:opacity-100 group-hover/hito:visible transition-all z-50 border border-zinc-800 pointer-events-none">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{formatStreakDate(rival.last_lost_match.fecha)}</span>
                                <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">{rival.last_lost_match.resultado}</span>
                            </div>
                            <div className="flex items-center space-x-3 mb-3">
                                <ClubShield src={rival.escudo_url || undefined} className="w-6 h-6" />
                                <span className="text-[10px] font-black text-white uppercase italic">Caída ante {rival.ri_desc}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter line-clamp-1">🏆 {rival.last_lost_match.torneo}</p>
                                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">📍 {rival.last_lost_match.condicion}</p>
                                <p className="text-[9px] font-black text-red-500 uppercase mt-2 pt-2 border-t border-white/5">Hace {getTimeSince(rival.last_lost_match.dias_transcurridos)}</p>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950 rotate-45 -mt-1.5 border-r border-b border-zinc-800" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xl font-black text-zinc-600 italic">NUNCA</span>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-red-950/40 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20 group-hover:bg-red-500 group-hover:text-red-950 transition-all shadow-xl group-hover:scale-110 transition-transform">
                    <ShieldAlert size={24} />
                  </div>
               </div>

               <div className="bg-zinc-800/30 backdrop-blur-md rounded-[40px] p-8 flex items-center justify-between border border-white/5 group shadow-xl lg:col-span-1">
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 block text-zinc-500">Vallas Invictas</span>
                    <span className="text-4xl font-black text-white italic tracking-tighter">{stats.vallas_invictas}</span>
                  </div>
                  <div className="w-14 h-14 bg-zinc-900 text-zinc-400 rounded-2xl flex items-center justify-center border border-zinc-700 group-hover:bg-white group-hover:text-zinc-900 group-hover:border-white transition-all shadow-xl group-hover:scale-110 transition-transform">
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
              <div className={`${rival.is_premium_restricted ? 'mask-fade-bottom' : ''}`}>
                <RivalMatches partidos={partidos} itemsPerPage={15} />
              </div>

              {/* Premium Restriction for Matches */}
              {rival.is_premium_restricted && (
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end h-64 bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent pb-8">
                  <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-zinc-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Lock size={28} />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-2 uppercase italic">Historial Restringido</h3>
                    <p className="text-zinc-500 text-sm mb-8 font-medium leading-relaxed">
                      Estás viendo una versión limitada del archivo. 
                      Los socios <span className="text-zinc-900 font-black">Premium</span> acceden a los {stats.pj} enfrentamientos históricos.
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

          {/* Right Column: Console Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-8">
               <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
                  <Activity size={20} />
               </div>
               <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic">
                  Consola de <span className="text-red-600">Rendimiento</span>
               </h2>
            </div>

            <div className="bg-zinc-900 rounded-[48px] p-8 text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
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
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">Últimos 20</span>
                </div>

                <div className="relative">
                  <div className={`flex flex-wrap gap-2 ${!isPremium ? 'blur-sm grayscale opacity-40 pointer-events-none' : ''}`}>
                    {last20Matches.map((p, idx) => (
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

                          {/* Advanced Tooltip matching StatsDashboard style */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-zinc-800 p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover/match:opacity-100 group-hover/match:visible transition-all z-50 border border-zinc-700 pointer-events-none">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[8px] font-black text-zinc-500 uppercase">
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
                              <ClubShield src={rival.escudo_url || undefined} className="w-6 h-6 shrink-0" />
                              <span className="text-xs font-black text-white truncate uppercase italic">{rival.ri_desc}</span>
                            </div>
                            <p className="mt-2 text-[7px] font-bold text-zinc-500 uppercase tracking-tighter truncate">{p.torneo?.tor_desc}</p>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45 -mt-1 border-r border-b border-zinc-700" />
                          </div>
                        </div>
                      ))}
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

              {/* Streaks Section */}
              <div className="pt-8 border-t border-white/5 relative z-10">
                <div className="flex items-center space-x-2 mb-6">
                  <History size={14} className="text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Rachas Históricas</span>
                </div>

                <div className="relative">
                  <div className={`space-y-4 ${!isPremium ? 'blur-md grayscale opacity-40 pointer-events-none' : ''}`}>
                    {/* Invincibility Streak */}
                    {rival.streaks.invincibility && (
                        <div className="bg-white/5 p-5 rounded-[24px] border border-emerald-500/10 hover:bg-white/10 transition-colors group/card relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 text-emerald-500/10 pointer-events-none">
                                <Shield size={40} />
                            </div>
                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <div>
                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1 italic">Invencibilidad Máxima</p>
                                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{rival.streaks.invincibility.count} <span className="text-xs uppercase ml-1">Partidos</span></h4>
                                </div>
                                {rival.streaks.invincibility.is_vigente && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 relative z-10">
                                <div className="flex items-center space-x-2 text-zinc-500">
                                    <Calendar size={10} />
                                    <span className="text-[9px] font-bold uppercase tracking-tight">{formatStreakDate(rival.streaks.invincibility.start_date)} — {formatStreakDate(rival.streaks.invincibility.end_date)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-zinc-400">
                                    <Timer size={10} />
                                    <span className="text-[9px] font-black uppercase">{rival.streaks.invincibility.duration_days} DÍAS DE DOMINIO</span>
                                </div>
                            </div>
                            {!rival.streaks.invincibility.is_vigente && (
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center space-x-2 text-zinc-500">
                                    <Clock size={10} />
                                    <span className="text-[8px] font-black uppercase">Terminó hace {getTimeSince(rival.streaks.invincibility.days_since_end)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Drought Streak */}
                    {rival.streaks.drought && (
                        <div className="bg-white/5 p-5 rounded-[24px] border border-red-500/10 hover:bg-white/10 transition-colors group/card relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 text-red-500/10 pointer-events-none">
                                <ShieldAlert size={40} />
                            </div>
                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <div>
                                    <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1 italic">Sequía Máxima</p>
                                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{rival.streaks.drought.count} <span className="text-xs uppercase ml-1">Partidos</span></h4>
                                </div>
                                {rival.streaks.drought.is_vigente && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></span>
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 relative z-10">
                                <div className="flex items-center space-x-2 text-zinc-500">
                                    <Calendar size={10} />
                                    <span className="text-[9px] font-bold uppercase tracking-tight">{formatStreakDate(rival.streaks.drought.start_date)} — {formatStreakDate(rival.streaks.drought.end_date)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-zinc-400">
                                    <Timer size={10} />
                                    <span className="text-[9px] font-black uppercase">{rival.streaks.drought.duration_days} DÍAS SIN GANAR</span>
                                </div>
                            </div>
                            {!rival.streaks.drought.is_vigente && (
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center space-x-2 text-zinc-500">
                                    <Clock size={10} />
                                    <span className="text-[8px] font-black uppercase">Terminó hace {getTimeSince(rival.streaks.drought.days_since_end)}</span>
                                </div>
                            )}
                        </div>
                    )}
                  </div>

                  {!isPremium && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-zinc-900/60 backdrop-blur-sm rounded-[32px] border border-white/5 mt-2">
                      <Star size={24} className="text-yellow-500 fill-yellow-500 mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-tighter text-white mb-2 italic">Análisis de Rachas Históricas</p>
                      <p className="text-zinc-500 text-[8px] font-medium mb-4 max-w-[140px] uppercase">Descubrí las secuencias de dominio y sequía más largas contra {rival.ri_desc}</p>
                      <Link href="/premium" className="bg-white text-zinc-900 px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-lg">
                        Hacerme Premium
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
                  River Plate tiene una diferencia neta de <span className="text-white font-black italic">{stats.dg > 0 ? `+${stats.dg}` : stats.dg}</span> goles frente a este adversario en {stats.pj} partidos oficiales.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Analysis Section - Same as Torneo page */}
        <section className="mt-20">
          <div className="flex flex-col mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight uppercase italic">Dinámica de Goles frente a este Rival</h2>
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
                <GoalsAnalysis filters={{ adversario: id }} />
                <GoalMethodAnalysis filters={{ adversario: id }} />
              </div>
            </AccessControl>
          </div>
        </section>
      </div>
    </div>
  );
}
