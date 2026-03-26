import { formatLocalDate } from "@/utils/date";
import { getPartidoByFecha } from "@/api/generated/endpoints/partidos/partidos";
import Link from "next/link";
import { 
  Trophy, 
  ChevronLeft, 
  Calendar, 
  UserRound, 
  Scale, 
  Timer, 
  FileText,
  Star,
  MapPinned,
  Flag,
  ChevronRight
} from "lucide-react";
import AccessControl from "@/components/AccessControl";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface Gol {
  gol_id: number;
  minutos: number;
  tipo_gol: number;
  periodo: number;
  gol_parariver: number; // 1: River, 2: Rival
  jugador?: {
    pl_id: number;
    pl_apno: string;
  };
}

interface PartidoDetail {
  fecha: string;
  goles_river: number;
  goles_rival: number;
  resultado: 'G' | 'E' | 'P';
  observaciones?: string;
  torneo?: {
    tor_desc: string;
  };
  rival?: {
    ri_desc: string;
  };
  arbitro?: {
    ar_desc: string;
  };
  estadio?: {
    es_desc: string;
  };
  condicion?: {
    co_desc: string;
  };
  fase?: {
    fa_desc: string;
  };
  tecnico?: {
    te_desc: string;
  };
  goles: Gol[];
}

export default async function PartidoDetailPage({
  params,
}: {
  params: Promise<{ fecha: string }>;
}) {
  const { fecha } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userRole = cookieStore.get('user_role')?.value;
  const isLoggedIn = !!token;
  const isPremium = userRole === 'premium';
  
  const currentTier: 'guest' | 'registered' | 'premium' = isPremium ? 'premium' : (isLoggedIn ? 'registered' : 'guest');

  let partido: PartidoDetail;
  try {
    const response = await getPartidoByFecha(
      fecha, 
      { headers: token ? { 'Authorization': `Bearer ${token}` } : {} } as any
    );
    // @ts-expect-error - SDK types are simplified
    partido = (response as any).data;
    
    if (!partido) {
      return notFound();
    }
  } catch (error) {
    console.error("Error fetching match detail:", error);
    return notFound();
  }

  // Filter goals for Free users (only River)
  const displayGoles = isPremium 
    ? (partido.goles || []) 
    : (partido.goles || []).filter(g => g.gol_parariver === 1);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Top Bar */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          <Link href="/partidos" className="flex items-center text-zinc-500 hover:text-red-600 transition-colors font-bold text-sm uppercase tracking-widest">
            <ChevronLeft size={20} className="mr-1" />
            Volver
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              {partido.torneo?.tor_desc}
            </span>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Match Hero / Scoreboard */}
      <section className="bg-white border-b border-zinc-200 pt-12 pb-16 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none flex justify-center items-center">
          <Trophy size={400} />
        </div>
        
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-4 sm:gap-12 mb-8 w-full">
              {/* River Plate */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-600 rounded-[32px] flex items-center justify-center text-white mb-4 shadow-xl shadow-red-100 border-4 border-white">
                  <span className="text-3xl sm:text-5xl font-black italic">R</span>
                </div>
                <span className="font-black text-zinc-900 text-sm sm:text-xl uppercase leading-tight">River Plate</span>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center shrink-0">
                <div className="flex items-center gap-4 sm:gap-8">
                  <span className="text-5xl sm:text-8xl font-black text-zinc-900 tracking-tighter tabular-nums">
                    {partido.goles_river}
                  </span>
                  <span className="text-2xl sm:text-4xl font-black text-zinc-200">-</span>
                  <span className="text-5xl sm:text-8xl font-black text-zinc-900 tracking-tighter tabular-nums">
                    {partido.goles_rival}
                  </span>
                </div>
                <div className={`mt-6 w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white shadow-xl ${
                  partido.resultado === 'G' ? 'bg-green-500 shadow-green-100' : 
                  partido.resultado === 'P' ? 'bg-red-500 shadow-red-100' : 
                  'bg-zinc-400 shadow-zinc-100'
                }`}>
                  {partido.resultado}
                </div>
              </div>

              {/* Rival */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-zinc-800 rounded-[32px] flex items-center justify-center text-white mb-4 shadow-xl shadow-zinc-100 border-4 border-white">
                  <span className="text-3xl sm:text-5xl font-black italic">{partido.rival?.ri_desc?.charAt(0)}</span>
                </div>
                <span className="font-black text-zinc-900 text-sm sm:text-xl uppercase leading-tight">{partido.rival?.ri_desc}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-y-2 gap-x-6 text-zinc-500 bg-zinc-50 px-6 py-3 rounded-2xl">
              <div className="flex items-center font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={14} className="mr-2 text-red-600" />
                {formatLocalDate(partido.fecha, { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              {partido.fase && (
                <div className="flex items-center font-bold text-[10px] uppercase tracking-widest border-l border-zinc-200 pl-6">
                  <Flag size={14} className="mr-2 text-red-600" />
                  {partido.fase.fa_desc}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Goals Timeline */}
        <div className="md:col-span-2 space-y-12">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center">
                <div className="w-2 h-8 bg-red-600 mr-3 rounded-full"></div>
                Línea de Tiempo
              </h2>
              {!isPremium && (
                <span className="text-[10px] font-black text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full uppercase tracking-widest">
                  Solo River (Modo Free)
                </span>
              )}
            </div>
            
            {displayGoles.length > 0 ? (
              <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200">
                {displayGoles.map((gol, idx) => (
                  <div key={idx} className="relative">
                    {/* Traffic light indicator on the timeline */}
                    <div className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 ${
                      gol.gol_parariver === 1 ? 'bg-red-600' : 'bg-zinc-800'
                    }`}>
                    </div>
                    
                    <div className={`bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between group transition-all hover:shadow-md ${
                      gol.gol_parariver === 1 ? 'hover:border-red-100' : 'hover:border-zinc-300'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          gol.gol_parariver === 1 ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          <Timer size={18} />
                        </div>
                        <div>
                          <p className="font-black text-zinc-900 uppercase tracking-tight text-sm">
                            {gol.jugador?.pl_apno || (gol.gol_parariver === 1 ? 'Goleador de River' : 'Goleador Rival')}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                              gol.gol_parariver === 1 ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white'
                            }`}>
                              {gol.gol_parariver === 1 ? 'RIVER' : partido.rival?.ri_desc}
                            </span>
                            {gol.tipo_gol === 1 && (
                              <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">
                                • Penal
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-2xl font-black text-zinc-200 group-hover:text-zinc-300 transition-colors tabular-nums">
                          {gol.minutos}'
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {!isPremium && partido.goles_rival > 0 && (
                  <div className="pt-4">
                    <Link href="/premium" className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl text-white group overflow-hidden relative">
                      <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform">
                        <Star size={80} />
                      </div>
                      <div className="relative z-10 flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-yellow-950">
                          <Star size={16} className="fill-current" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-tight">Ver goles de {partido.rival?.ri_desc}</p>
                      </div>
                      <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[32px] border border-zinc-100 text-center">
                <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest italic">No hay incidencias detalladas para este encuentro</p>
              </div>
            )}
          </div>

          {/* Observations */}
          <div>
            <h2 className="text-2xl font-black text-zinc-900 mb-8 uppercase tracking-tight flex items-center">
              <div className="w-2 h-8 bg-zinc-900 mr-3 rounded-full"></div>
              Crónica Histórica
            </h2>
            
            <AccessControl tier={currentTier} requiredTier="premium" className="rounded-[40px] overflow-hidden shadow-xl border border-zinc-100">
              <div className="bg-white p-8 md:p-10">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-100">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-600 leading-relaxed font-medium whitespace-pre-line text-sm md:text-base">
                      {partido.observaciones || "Este partido es parte de la gloriosa historia millonaria. No se registran observaciones adicionales en el archivo para este encuentro específico."}
                    </p>
                  </div>
                </div>
              </div>
            </AccessControl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 uppercase tracking-tight flex items-center">
            <div className="w-2 h-8 bg-yellow-500 mr-3 rounded-full"></div>
            Ficha Técnica
          </h2>

          <AccessControl tier={currentTier} requiredTier="premium" className="rounded-[40px] overflow-hidden shadow-xl border border-zinc-100">
            <div className="bg-white p-8 space-y-8 relative">
              {/* Stadium */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-100">
                  <MapPinned size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Estadio</p>
                  <p className="font-black text-zinc-900 text-sm uppercase leading-tight">{partido.estadio?.es_desc || 'No informado'}</p>
                  <p className="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-tighter">{partido.condicion?.co_desc || 'Condición desconocida'}</p>
                </div>
              </div>

              {/* Coach */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-100">
                  <UserRound size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Director Técnico</p>
                  <p className="font-black text-zinc-900 text-sm uppercase leading-tight">{partido.tecnico?.te_desc || 'No informado'}</p>
                </div>
              </div>

              {/* Referee */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-100">
                  <Scale size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Árbitro</p>
                  <p className="font-black text-zinc-900 text-sm uppercase leading-tight">{partido.arbitro?.ar_desc || 'No informado'}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 mt-6 flex items-center gap-2">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Verificado Premium</span>
              </div>
            </div>
          </AccessControl>
        </div>
      </div>
    </div>
  );
}
