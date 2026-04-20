import { ShieldAlert, Target, TrendingUp, Calendar, Zap, Info, Star, Lock, Award, Shield, Percent, Activity } from "lucide-react";
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

interface Partido {
  fecha: string;
  fecha_nro?: number;
  goles_river: number;
  goles_rival: number;
  resultado: string;
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

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <GoBack href="/rivales" label="Archivo de Rivales" />

        {/* Hero Head-to-Head */}
        <section className="bg-white rounded-[48px] border border-zinc-100 p-8 md:p-16 shadow-xl shadow-zinc-200/50 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none rotate-12">
            <ShieldAlert size={400} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
               <div className="flex flex-col items-center flex-1 order-1">
                  <div className="w-32 h-32 md:w-48 md:h-48 relative mb-8 group">
                    <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <RiverOfficialShield className="w-full h-full drop-shadow-2xl" />
                    </div>
                  </div>
                  <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-red-100 mb-4">Anfitrión</span>
                  <h1 className="text-4xl md:text-5xl font-black text-zinc-900 uppercase tracking-tighter leading-tight italic text-center">
                    River <span className="text-red-600">Plate</span>
                  </h1>
               </div>
               
               <div className="flex flex-col items-center gap-4 order-2">
                  <div className="w-20 h-20 bg-zinc-900 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl border-4 border-white rotate-3">VS</div>
                  <div className="h-24 w-px bg-gradient-to-b from-zinc-200 to-transparent hidden md:block" />
               </div>

               <div className="flex flex-col items-center flex-1 order-3">
                  <div className="w-32 h-32 md:w-48 md:h-48 relative mb-8 group">
                    <div className="absolute inset-0 bg-zinc-900 rounded-full blur-2xl opacity-5 group-hover:opacity-10 transition-opacity" />
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-4 bg-zinc-50 rounded-full border border-zinc-100 group-hover:border-zinc-200 transition-colors">
                      {rival.escudo_url ? (
                        <Image 
                          src={rival.escudo_url} 
                          alt={rival.ri_desc} 
                          width={140} 
                          height={140} 
                          className="object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <Shield size={80} className="text-zinc-200" />
                      )}
                    </div>
                  </div>
                  <span className="bg-zinc-100 text-zinc-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">Adversario</span>
                  <h1 className="text-4xl md:text-5xl font-black text-zinc-900 uppercase tracking-tighter leading-tight italic text-center">
                    {rival.ri_desc}
                  </h1>
               </div>
            </div>
            
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: 'PJ', value: stats.pj, icon: Activity, color: 'zinc' },
                { label: 'PG', value: stats.pg, icon: Zap, color: 'emerald' },
                { label: 'PE', value: stats.pe, icon: Shield, color: 'blue' },
                { label: 'PP', value: stats.pp, icon: ShieldAlert, color: 'red' },
                { label: 'GF', value: stats.gf, icon: Target, color: 'zinc' },
                { label: 'GC', value: stats.gc, icon: ShieldAlert, color: 'zinc' },
                { label: 'DG', value: stats.dg, icon: TrendingUp, color: 'zinc', prefix: stats.dg > 0 ? '+' : '' },
              ].map((item) => (
                <div key={item.label} className="bg-zinc-50 p-6 rounded-[32px] text-center border border-zinc-100 hover:bg-white hover:shadow-lg transition-all group">
                  <item.icon size={16} className={`mx-auto mb-3 text-${item.color}-500 opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <span className={`block text-3xl font-black text-zinc-900 mb-1 tabular-nums`}>{item.prefix}{item.value}</span>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-zinc-900 rounded-[32px] p-6 flex items-center justify-between text-white group overflow-hidden relative">
                  <Percent className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-red-600/20 transition-colors" size={120} />
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 block">Efectividad Histórica</span>
                    <span className="text-4xl font-black italic">{stats.efectividad}%</span>
                  </div>
                  <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform relative z-10">
                    <TrendingUp size={28} />
                  </div>
               </div>
               <div className="bg-white rounded-[32px] p-6 flex items-center justify-between border border-zinc-100 group shadow-sm">
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1 block">Vallas Invictas</span>
                    <span className="text-4xl font-black text-zinc-900 italic">{stats.vallas_invictas}</span>
                  </div>
                  <div className="w-16 h-16 bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                    <Shield size={28} />
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

          {/* Right Column: Key Balance */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-8">
               <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
                  <Target size={20} />
               </div>
               <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic">
                  Balance de <span className="text-red-600">Goles</span>
               </h2>
            </div>

            <div className="bg-zinc-900 rounded-[48px] p-8 text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center space-x-3 mb-10 relative z-10">
                 <Target className="text-red-500" size={20} />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Producción de Goles</span>
              </div>
              
              <div className="space-y-8 relative z-10">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                    <span className="text-zinc-400 group-hover:text-red-500 transition-colors italic">A Favor (CARP)</span>
                    <span className="text-white text-lg tabular-nums italic">{stats.gf}</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                     <div className="h-full bg-red-600 rounded-full shadow-lg shadow-red-900/40" style={{ width: `${stats.pj > 0 ? (stats.gf / (stats.gf + stats.gc)) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                    <span className="text-zinc-400 group-hover:text-white transition-colors italic">En Contra</span>
                    <span className="text-white text-lg tabular-nums italic">{stats.gc}</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                     <div className="h-full bg-zinc-600 rounded-full" style={{ width: `${stats.pj > 0 ? (stats.gc / (stats.gf + stats.gc)) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 group-hover:border-red-600/20 transition-all">
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
