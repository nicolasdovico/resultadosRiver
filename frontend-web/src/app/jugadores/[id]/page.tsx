import { formatLocalDate } from "@/utils/date";
import { ChevronLeft, Trophy, Star, TrendingUp, Calendar, Hash, Timer, Target, Shield, Zap, Activity } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";
import Image from "next/image";
import { cookies } from "next/headers";

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

interface Jugador {
  pl_id: number;
  pl_apno: string;
  pl_foto?: string | null;
  goles_count: number;
  goles: Gol[];
  is_premium_restricted?: boolean;
}

export default async function JugadorDetailPage({
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

  let jugador: Jugador | null = null;
  try {
    const response = await customInstance<{ data: Jugador }>({
      url: `/v1/jugadores/${id}`,
      method: "GET",
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

  const rivalFavorito = jugador.goles.reduce((acc: any, gol) => {
    const rivalName = gol.partido?.rival?.ri_desc || "Desconocido";
    acc[rivalName] = (acc[rivalName] || 0) + 1;
    return acc;
  }, {});

  const topRival = Object.entries(rivalFavorito).sort((a: any, b: any) => b[1] - a[1])[0] || ["-", 0];

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
              <div className="w-48 h-48 md:w-64 md:h-64 bg-zinc-800 rounded-[60px] flex items-center justify-center text-zinc-700 font-black text-8xl shadow-2xl border-2 border-zinc-700 overflow-hidden relative group">
                {jugador.pl_foto ? (
                  <Image src={jugador.pl_foto} alt={jugador.pl_apno} fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="leading-none">{jugador.pl_apno.charAt(0)}</span>
                    {!jugador.pl_foto && (
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                          <span className="text-[10px] text-white font-black uppercase tracking-widest text-center px-4">Foto solo para Premium</span>
                       </div>
                    )}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Goles Totales</span>
                  </div>
                  <span className="block text-4xl font-black text-white tabular-nums">{jugador.goles_count}</span>
                </div>
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Rival Favorito</span>
                  </div>
                  <span className="block text-lg font-black text-white uppercase truncate">{topRival[0]}</span>
                </div>
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Status</span>
                  </div>
                  <span className="block text-lg font-black text-white uppercase">{jugador.goles_count > 50 ? "Leyenda" : "Goleador"}</span>
                </div>
                <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-zinc-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Efectividad</span>
                  </div>
                  <span className="block text-4xl font-black text-white tabular-nums">100<span className="text-sm ml-1 opacity-50">%</span></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content: History */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic flex items-center">
                <Star className="mr-4 text-red-600 fill-red-600" size={24} />
                Historial de Goles
              </h2>
              {jugador.is_premium_restricted && (
                <span className="bg-zinc-100 text-zinc-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-200">
                  Vista Limitada
                </span>
              )}
            </div>

            <div className="space-y-4">
              {jugador.goles.map((gol, index) => (
                <div key={index} className="bg-white p-6 rounded-[40px] border border-zinc-100 flex items-center justify-between shadow-sm group hover:border-red-600 transition-all duration-300">
                  <div className="flex items-center space-x-6">
                    {/* Rival Crest Placeholder */}
                    <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center border border-zinc-100 shadow-inner group-hover:scale-110 transition-transform overflow-hidden relative">
                      {gol.partido?.rival?.escudo ? (
                        <Image src={gol.partido.rival.escudo} alt={gol.partido.rival.ri_desc} fill className="object-contain p-2" />
                      ) : (
                        <Trophy size={24} className="text-zinc-200" />
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Gol #{index + 1}</span>
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
              ))}

              {jugador.is_premium_restricted && (
                <div className="mt-12">
                   <AccessControl tier={currentTier} requiredTier="premium" className="rounded-[48px] h-64 shadow-xl border-4 border-white" />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Premium Analytics */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-black text-zinc-900 mb-8 tracking-tighter uppercase italic flex items-center">
              <TrendingUp className="mr-4 text-red-600" size={24} />
              Analítica
            </h2>

            <AccessControl tier={currentTier} requiredTier="premium">
              <div className="bg-zinc-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden border-4 border-white">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Activity size={120} />
                </div>
                
                <h3 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-red-500 italic">Distribución Anual</h3>
                
                <div className="space-y-8 relative z-10">
                  {[
                    { year: 'Histórico', count: jugador.goles_count, max: jugador.goles_count },
                    { year: 'Rival Favorito', count: topRival[1], max: jugador.goles_count },
                  ].map((item) => (
                    <div key={item.year}>
                      <div className="flex justify-between text-[10px] font-black uppercase mb-3 tracking-widest opacity-60">
                        <span>{item.year}</span>
                        <span>{item.count} {typeof item.count === 'number' && item.count === 1 ? 'Gol' : 'Goles'}</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <div className="h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: `${(Number(item.count) / Number(item.max)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 pt-12 border-t border-white/10">
                  <p className="text-xs font-medium text-zinc-400 mb-8 leading-relaxed uppercase tracking-tight">
                    Este jugador representa el <span className="text-white font-black">{(jugador.goles_count / 100).toFixed(2)}%</span> de la efectividad histórica del club en su posición.
                  </p>
                  
                  <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer">
                    <Target className="text-red-500 mb-4" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Eficiencia de Remate</p>
                    <p className="text-xl font-black text-white italic tracking-tighter uppercase">Análisis Proyectado</p>
                  </div>
                </div>
              </div>
            </AccessControl>
          </div>
        </div>
      </div>
    </div>
  );
}
