import { formatLocalDate } from "@/utils/date";
import { getPartidos } from "@/api/generated/endpoints/partidos/partidos";
import { getRivales } from "@/api/generated/endpoints/rivales/rivales";
import { getEstadios } from "@/api/generated/endpoints/estadios/estadios";
import { getArbitros } from "@/api/generated/endpoints/arbitros/arbitros";
import { getTorneos, getTorneoNiveles } from "@/api/generated/endpoints/torneos/torneos";
import Link from "next/link";
import { 
  Trophy, 
  ChevronRight, 
  Calendar, 
  BarChart3, 
  Clock, 
  Star, 
  Info, 
  TrendingUp,
  Target,
  Shield,
  Zap,
  Swords,
  Activity,
  Award
} from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { cookies } from "next/headers";
import ClubShield from "@/components/ClubShield";
import RiverOfficialShield from "@/components/RiverOfficialShield";
import GoalsAnalysis from "@/components/GoalsAnalysis";
import GoalMethodAnalysis from "@/components/GoalMethodAnalysis";
import PartidoFilters from "@/components/PartidoFilters";

export default async function PartidosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userRole = cookieStore.get('user_role')?.value;
  const isLoggedIn = !!token;
  const isPremium = userRole === 'premium';
  
  const currentTier: 'guest' | 'registered' | 'premium' = isPremium ? 'premium' : (isLoggedIn ? 'registered' : 'guest');
  
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const rivalId = typeof params.adversario === 'string' ? parseInt(params.adversario, 10) : undefined;
  const estadioId = typeof params.estadio === 'string' ? parseInt(params.estadio, 10) : undefined;
  const arbitroId = typeof params.arbitro === 'string' ? parseInt(params.arbitro, 10) : undefined;
  const torneoId = typeof params.torneo === 'string' ? parseInt(params.torneo, 10) : undefined;
  const torneoNivel = typeof params.torneo_nivel === 'string' ? params.torneo_nivel : undefined;
  const condicion = typeof params.condicion === 'string' ? params.condicion : undefined;
  const fechaDesde = typeof params.fecha_desde === 'string' ? params.fecha_desde : undefined;
  const fechaHasta = typeof params.fecha_hasta === 'string' ? params.fecha_hasta : undefined;
  
  let currentPage = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;

  const hasAnyFilter = query || rivalId || estadioId || arbitroId || torneoId || torneoNivel || condicion || fechaDesde || fechaHasta;

  // Force page 1 for free users on the default list
  if (isLoggedIn && !isPremium && !hasAnyFilter) {
    currentPage = 1;
  }

  const fetchOptions = { headers: token ? { 'Authorization': `Bearer ${token}` } : {} } as any;

  // Fetch filter options in parallel
  const [rivalesRes, estadiosRes, arbitrosRes, torneosRes, nivelesRes] = await Promise.all([
    getRivales({ limit: -1 } as any, fetchOptions),
    getEstadios({ limit: -1 } as any, fetchOptions),
    getArbitros({ limit: -1 } as any, fetchOptions),
    getTorneos({ limit: -1 } as any, fetchOptions),
    getTorneoNiveles(fetchOptions),
  ]);

  // @ts-ignore - access to .data because Laravel wraps the response in data
  const rivalesOptions = (rivalesRes.data || []).map((r: any) => ({ id: r.ri_id, label: r.ri_desc }));
  // @ts-ignore
  const estadiosOptions = (estadiosRes.data || []).map((e: any) => ({ id: e.es_id, label: e.es_desc }));
  // @ts-ignore
  const arbitrosOptions = (arbitrosRes.data || []).map((a: any) => ({ id: a.ar_id, label: a.ar_desc }));
  // @ts-ignore
  const torneosOptions = (torneosRes.data || []).map((t: any) => ({ id: t.tor_id, label: t.tor_desc }));
  const nivelesOptions = nivelesRes as any || [];

  // Pass search params directly to API
  const response = await getPartidos(
    { 
      q: query,
      adversario: rivalId,
      estadio: isPremium ? estadioId : undefined,
      arbitro: isPremium ? arbitroId : undefined,
      torneo: torneoId,
      torneo_nivel: isPremium ? torneoNivel : undefined,
      condicion: condicion,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      hoy: (hasAnyFilter || isLoggedIn) ? undefined : true,
      limit: (isLoggedIn && !hasAnyFilter) ? 10 : undefined,
      page: currentPage
    } as any, 
    fetchOptions
  );
  
  // @ts-expect-error - Resource data structure is not fully typed in SDK
  let visiblePartidos: any[] = (response as { data?: any[] }).data || [];
  // @ts-expect-error - Meta missing from response type
  const totalResults = (response as any).meta?.total || visiblePartidos.length;
  // @ts-expect-error - Meta missing from response type
  const lastPage = (response as any).meta?.last_page || 1;
  // @ts-expect-error - summary in meta
  const summary = (response as any).meta?.summary || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0 };

  // Restriction logic for non-premium users
  let shownCount = visiblePartidos.length;
  let isRestricted = false;

  if (isLoggedIn && !isPremium) {
    if (hasAnyFilter) {
      let limit = 20;
      if (totalResults <= 20) {
        limit = Math.max(3, Math.floor(totalResults * 0.5));
      }
      
      if (totalResults > limit) {
        visiblePartidos = visiblePartidos.slice(0, limit);
        shownCount = limit;
        isRestricted = true;
      }
    } else {
      isRestricted = true;
      shownCount = visiblePartidos.length;
    }
  }

  // Calculate streak from visible matches (sorted ascending for correct chronological order)
  const partidosStreak = [...visiblePartidos].reverse();

  const StatBox = ({ label, stats, isTotal = false }: { label: string, stats: any, isTotal?: boolean }) => (
    <div className={`flex-1 p-8 ${!isTotal ? 'border-l border-white/5' : ''} transition-all duration-500 hover:bg-white/[0.02]`}>
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={`w-1.5 h-1.5 rounded-full ${isTotal ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-zinc-600'}`} />
        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] text-center">{label}</h4>
      </div>
      
      <div className="space-y-4">
        {/* PJ row */}
        <div className="flex justify-between items-center group/stat">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover/stat:text-white transition-colors border border-white/5">
              <Activity size={14} />
            </div>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Partidos</span>
          </div>
          <span className="text-xl font-black text-white tabular-nums tracking-tighter">{stats.pj}</span>
        </div>

        {/* Results row */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="bg-zinc-800/30 rounded-xl p-3 border border-white/5 flex flex-col items-center gap-1 group/item hover:bg-zinc-800/50 transition-all">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">PG</span>
            <span className="text-lg font-black text-green-500 tabular-nums">{stats.pg}</span>
          </div>
          <div className="bg-zinc-800/30 rounded-xl p-3 border border-white/5 flex flex-col items-center gap-1 group/item hover:bg-zinc-800/50 transition-all">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">PE</span>
            <span className="text-lg font-black text-zinc-400 tabular-nums">{stats.pe}</span>
          </div>
          <div className="bg-zinc-800/30 rounded-xl p-3 border border-white/5 flex flex-col items-center gap-1 group/item hover:bg-zinc-800/50 transition-all">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">PP</span>
            <span className="text-lg font-black text-red-500 tabular-nums">{stats.pp}</span>
          </div>
        </div>

        {/* Goals section */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex justify-between items-center group/stat">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover/stat:text-green-500 transition-colors border border-white/5">
                <Target size={14} />
              </div>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">A Favor</span>
            </div>
            <span className="text-base font-black text-white tabular-nums">{stats.gf}</span>
          </div>
          
          <div className="flex justify-between items-center group/stat">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover/stat:text-red-500 transition-colors border border-white/5">
                <Shield size={14} />
              </div>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">En Contra</span>
            </div>
            <span className="text-base font-black text-zinc-400 tabular-nums">{stats.gc}</span>
          </div>

          <div className="mt-4 bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 ${stats.dg > 0 ? 'bg-green-500/10 text-green-500' : stats.dg < 0 ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800/50 text-zinc-500'}`}>
                <Zap size={14} />
              </div>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Dif. Gol</span>
            </div>
            <span className={`text-lg font-black tabular-nums ${stats.dg > 0 ? 'text-green-500' : stats.dg < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
              {stats.dg > 0 ? '+' : ''}{stats.dg}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Historial de Partidos</h1>
          </div>
          <p className="text-zinc-500 font-medium max-w-xl">
            Cada batalla, cada victoria. Explora el archivo completo de encuentros del Club Atlético River Plate.
          </p>
        </div>
        <div className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center">
          <Calendar className="mr-2" size={14} />
          {hasAnyFilter ? `${totalResults} encontrados` : `Archivo Completo`}
        </div>
      </div>

      {/* Advanced Filters */}
      {isLoggedIn && (
        <PartidoFilters 
          rivales={rivalesOptions}
          estadios={estadiosOptions}
          arbitros={arbitrosOptions}
          torneos={torneosOptions}
          niveles={nivelesOptions}
          isPremium={isPremium}
        />
      )}

      {/* Stats Summary Dashboard */}
      {visiblePartidos.length > 0 && (
        <div className="mb-12">
          <AccessControl tier={currentTier} requiredTier="premium">
            <div className="bg-zinc-900 rounded-[40px] overflow-hidden shadow-2xl border border-white/5">
              <div className="flex flex-col md:flex-row">
                <StatBox label="Resumen Total" stats={summary} isTotal />
                {summary.breakdown && (
                  <>
                    <StatBox label="Como Local" stats={summary.breakdown.local} />
                    <StatBox label="Como Visitante" stats={summary.breakdown.visitante} />
                    <StatBox label="Cancha Neutral" stats={summary.breakdown.neutral} />
                  </>
                )}
              </div>
            </div>
          </AccessControl>
        </div>
      )}

      {/* Form Guide (Racha) - Blurred for non-premium users */}
      {visiblePartidos.length > 0 && (
        <div className="mb-12">
          <AccessControl tier={currentTier} requiredTier="premium">
            <div className="bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center">
                <TrendingUp size={14} className="mr-2 text-red-500" /> 
                Racha de resultados mostrados
              </h4>
              <div className="flex flex-wrap gap-2">
                {partidosStreak.map((p, idx) => {
                  const extraInfo = [
                    p.torneo?.tor_desc,
                    p.fase?.fa_desc,
                    p.fecha_nro ? `Fecha ${p.fecha_nro}` : null
                  ].filter(Boolean).join(' - ');

                  return (
                    <div 
                      key={idx} 
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm cursor-help transition-all hover:scale-110 ${
                        p.resultado === 'G' ? 'bg-green-500 text-green-950' : 
                        p.resultado === 'P' ? 'bg-red-500 text-red-950' : 
                        'bg-zinc-200 text-zinc-600'
                      }`}
                      title={`${formatLocalDate(p.fecha)} | ${p.resultado}: ${p.goles_river}-${p.goles_rival} vs ${p.rival?.ri_desc}${extraInfo ? ` (${extraInfo})` : ''}`}
                    >
                      {p.resultado}
                    </div>
                  );
                })}
              </div>
            </div>
          </AccessControl>
        </div>
      )}

      {/* Recent Results Teaser (ONLY for guests and when no query) */}
      {!hasAnyFilter && !isLoggedIn && (
        <section className="mb-16">
          <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center tracking-tight uppercase">
            <Clock className="mr-3 text-red-600" size={20} />
            Resultados Recientes
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visiblePartidos.slice(0, 4).map((p) => (
              <div key={p.fecha} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm flex items-center justify-between">
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{formatLocalDate(p.fecha)}</span>
                    {p.fase && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">{p.fase.fa_desc}</span>
                    )}
                    {p.fecha_nro && (
                      <span className="text-[9px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Fecha {p.fecha_nro}</span>
                    )}
                    {p.condicion && (
                      <span className="text-[9px] bg-amber-50 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">{p.condicion.co_desc}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 shrink-0 relative">
                      <ClubShield 
                        src={p.rival?.escudo_url} 
                        alt={p.rival?.ri_desc} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-black text-zinc-800 tracking-tight line-clamp-1">{p.rival?.ri_desc}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-2xl font-black ${p.resultado === 'G' ? 'text-green-600' : p.resultado === 'P' ? 'text-red-600' : 'text-zinc-400'}`}>
                    {p.goles_river} - {p.goles_rival}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white ${p.resultado === 'G' ? 'bg-green-500' : p.resultado === 'P' ? 'bg-red-500' : 'bg-zinc-400'}`}>
                    {p.resultado}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main List with Access Control */}
      <section className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
            {isLoggedIn && !hasAnyFilter ? 'Últimos 10 Partidos' : 'Archivo Histórico'}
          </h2>
        </div>

        {/* Premium Restriction Banner */}
        {isRestricted && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm shadow-yellow-900/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-yellow-600 shrink-0 shadow-sm">
                <Info size={24} />
              </div>
              <p className="text-yellow-900 font-medium text-sm md:text-base">
                {hasAnyFilter ? (
                  <>Mostrando <span className="font-black">{shownCount}</span> de <span className="font-black">{totalResults}</span> resultados encontrados.</>
                ) : (
                  <>Mostrando los últimos <span className="font-black">{shownCount}</span> partidos de un total de <span className="font-black">{totalResults}</span>.</>
                )}{" "}
                Los socios <span className="font-black">Premium</span> acceden al archivo histórico completo y filtros avanzados.
              </p>
            </div>
            <Link href="/premium" className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center whitespace-nowrap">
              <Star className="mr-2 fill-yellow-400 text-yellow-400" size={14} />
              Hacerme Premium
            </Link>
          </div>
        )}

        {visiblePartidos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visiblePartidos.map((partido) => (
                <Link 
                  key={partido.fecha} 
                  href={`/partidos/${partido.fecha}`}
                  className="bg-white p-6 rounded-[32px] border border-zinc-100 hover:border-red-200 transition-all flex items-center group shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{formatLocalDate(partido.fecha)}</span>
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight line-clamp-1">{partido.torneo?.tor_desc}</span>
                      {partido.fase && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">{partido.fase.fa_desc}</span>
                      )}
                      {partido.fecha_nro && (
                        <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Fecha {partido.fecha_nro}</span>
                      )}
                      {partido.condicion && (
                        <span className="text-[10px] bg-amber-50 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">{partido.condicion.co_desc}</span>
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
                            src={partido.rival?.escudo_url} 
                            alt={partido.rival?.ri_desc} 
                          />
                          <span className="text-sm text-zinc-500 font-bold">{partido.rival?.ri_desc}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-end mr-2">
                          <span className={`text-2xl font-black ${partido.resultado === 'G' ? 'text-green-600' : partido.resultado === 'P' ? 'text-red-600' : 'text-zinc-400'}`}>
                            {partido.goles_river} - {partido.goles_rival}
                          </span>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm ${
                          partido.resultado === 'G' ? 'bg-green-500 shadow-green-100' : 
                          partido.resultado === 'P' ? 'bg-red-500 shadow-red-100' : 
                          'bg-zinc-400 shadow-zinc-100'
                        }`}>
                          {partido.resultado}
                        </div>
                        <ChevronRight className="text-zinc-300 group-hover:text-red-400 transition-colors ml-2" size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {!isRestricted && lastPage > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                {currentPage > 1 ? (
                  <Link 
                    href={`/partidos?${new URLSearchParams({ 
                      ...(query ? { q: query } : {}), 
                      ...(rivalId ? { adversario: rivalId.toString() } : {}),
                      ...(estadioId ? { estadio: estadioId.toString() } : {}),
                      ...(arbitroId ? { arbitro: arbitroId.toString() } : {}),
                      ...(torneoId ? { torneo: torneoId.toString() } : {}),
                      ...(torneoNivel ? { torneo_nivel: torneoNivel } : {}),
                      page: (currentPage - 1).toString() 
                    }).toString()}`}
                    className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 font-bold text-sm hover:border-red-200 hover:text-red-600 transition-colors"
                  >
                    Anterior
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-400 font-bold text-sm cursor-not-allowed">
                    Anterior
                  </span>
                )}
                
                <div className="px-4 py-2 bg-zinc-100 rounded-xl text-zinc-600 font-black text-sm">
                  Página {currentPage} de {lastPage}
                </div>
                
                {currentPage < lastPage ? (
                  <Link 
                    href={`/partidos?${new URLSearchParams({ 
                      ...(query ? { q: query } : {}), 
                      ...(rivalId ? { adversario: rivalId.toString() } : {}),
                      ...(estadioId ? { estadio: estadioId.toString() } : {}),
                      ...(arbitroId ? { arbitro: arbitroId.toString() } : {}),
                      ...(torneoId ? { torneo: torneoId.toString() } : {}),
                      ...(torneoNivel ? { torneo_nivel: torneoNivel } : {}),
                      page: (currentPage + 1).toString() 
                    }).toString()}`}
                    className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 font-bold text-sm hover:border-red-200 hover:text-red-600 transition-colors"
                  >
                    Siguiente
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-400 font-bold text-sm cursor-not-allowed">
                    Siguiente
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
            <Trophy className="mx-auto mb-4 text-zinc-300" size={48} />
            <h3 className="text-xl font-black text-zinc-900 mb-2">No hay resultados para esta búsqueda</h3>
            <p className="text-zinc-500 font-medium">Prueba ajustando los filtros o buscando otro equipo.</p>
          </div>
        )}

        {/* Premium Section Teaser */}
        <section className="mt-20">
          <div className="flex flex-col mb-10">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight uppercase">Análisis de Resultados</h2>
            <p className="text-zinc-500 font-medium">Distribución de goles y efectividad por periodos.</p>
          </div>

          <AccessControl tier={currentTier} requiredTier="premium" className="rounded-[40px] overflow-hidden shadow-xl border border-zinc-100">
            <div className="flex flex-col">
              <GoalsAnalysis filters={{ 
                q: query,
                adversario: rivalId,
                torneo: torneoId,
              }} />
              <GoalMethodAnalysis filters={{ 
                q: query,
                adversario: rivalId,
                torneo: torneoId,
              }} />
            </div>
          </AccessControl>
        </section>
      </section>
    </div>
  );
}
