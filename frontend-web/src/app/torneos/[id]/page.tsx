import { formatLocalDate } from "@/utils/date";
import { ChevronLeft, Star, Trophy, Calendar, ChevronRight, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";
import ClubShield from "@/components/ClubShield";
import RiverOfficialShield from "@/components/RiverOfficialShield";
import { cookies } from "next/headers";
import GoalsAnalysis from "@/components/GoalsAnalysis";
import GoalMethodAnalysis from "@/components/GoalMethodAnalysis";

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

interface Torneo {
  tor_id: number;
  tor_desc: string;
  tor_nivel: string;
  partidos: Partido[];
  stats?: TorneoStats;
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
            {partidosAsc.length > 0 ? (
              <div className="space-y-4">
                {partidosAsc.map((p) => (
                  <Link 
                    key={p.fecha} 
                    href={`/partidos/${p.fecha}`}
                    className="bg-white p-6 rounded-[32px] border border-zinc-100 hover:border-red-200 transition-all flex items-center group shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{formatLocalDate(p.fecha)}</span>
                        {p.fase && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">{p.fase.fa_desc}</span>
                        )}
                        {p.fecha_nro && (
                          <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Fecha {p.fecha_nro}</span>
                        )}
                        {p.condicion && (
                          <span className="text-[10px] bg-amber-50 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">{p.condicion.co_desc}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-3">
                            <RiverOfficialShield />
                            <span className="font-black text-lg text-zinc-800 tracking-tight">River Plate</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <ClubShield 
                              src={p.rival?.escudo_url} 
                              alt={p.rival?.ri_desc} 
                            />
                            <span className="text-sm text-zinc-500 font-bold">{p.rival?.ri_desc}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-end mr-2">
                            <span className={`text-2xl font-black ${p.resultado === 'G' ? 'text-green-600' : p.resultado === 'P' ? 'text-red-600' : 'text-zinc-400'}`}>
                              {p.goles_river} - {p.goles_rival}
                            </span>
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm ${
                            p.resultado === 'G' ? 'bg-green-500 shadow-green-100' : 
                            p.resultado === 'P' ? 'bg-red-500 shadow-red-100' : 
                            'bg-zinc-400 shadow-zinc-100'
                          }`}>
                            {p.resultado}
                          </div>
                          <ChevronRight className="text-zinc-300 group-hover:text-red-400 transition-colors ml-2" size={20} />
                        </div>
                      </div>
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

