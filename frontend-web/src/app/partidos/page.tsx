import { formatLocalDate } from "@/utils/date";
import { getPartidos } from "@/api/generated/endpoints/partidos/partidos";
import Link from "next/link";
import { Trophy, ChevronRight, Calendar, BarChart3, Clock, Star, Info } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { cookies } from "next/headers";
import ClubShield from "@/components/ClubShield";
import RiverOfficialShield from "@/components/RiverOfficialShield";
import GoalsAnalysis from "@/components/GoalsAnalysis";
import GoalMethodAnalysis from "@/components/GoalMethodAnalysis";

interface Partido {
  fecha: string;
  fecha_nro?: number;
  rival: {
    ri_desc: string;
    escudo_url?: string;
  };
  torneo: {
    tor_desc: string;
    tor_nivel: string;
  };
  fase?: {
    fa_desc: string;
  };
  condicion?: {
    co_desc: string;
  };
  goles_river: number;
  goles_rival: number;
  resultado: string;
}

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
  let currentPage = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;

  // Force page 1 for free users on the default list
  if (isLoggedIn && !isPremium && !query) {
    currentPage = 1;
  }

  // Pass search query directly to API
  const response = await getPartidos(
    { 
      q: query, 
      hoy: (query || isLoggedIn) ? undefined : true,
      limit: (isLoggedIn && !query) ? 10 : undefined,
      page: currentPage
    } as any, 
    { headers: token ? { 'Authorization': `Bearer ${token}` } : {} } as any
  );
  
  // @ts-expect-error - Resource data structure is not fully typed in SDK
  let visiblePartidos: any[] = (response as { data?: any[] }).data || [];
  // @ts-expect-error - Meta missing from response type
  const totalResults = (response as any).meta?.total || visiblePartidos.length;
  // @ts-expect-error - Meta missing from response type
  const lastPage = (response as any).meta?.last_page || 1;

  // Restriction logic for non-premium users
  let shownCount = visiblePartidos.length;
  let isRestricted = false;

  if (isLoggedIn && !isPremium) {
    if (query) {
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
          {query ? `${totalResults} encontrados` : `Archivo Completo`}
        </div>
      </div>

      {/* Recent Results Teaser (ONLY for guests and when no query) */}
      {!query && !isLoggedIn && (
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
            {isLoggedIn && !query ? 'Últimos 10 Partidos' : 'Archivo Histórico'}
          </h2>
          {isLoggedIn && (
            <SearchBar placeholder="Buscar por rival o torneo..." className="w-full md:max-w-md" />
          )}
        </div>

        {/* Premium Restriction Banner */}
        {isRestricted && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm shadow-yellow-900/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-yellow-600 shrink-0 shadow-sm">
                <Info size={24} />
              </div>
              <p className="text-yellow-900 font-medium text-sm md:text-base">
                {query ? (
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
                    href={`/partidos?${new URLSearchParams({ ...(query ? { q: query } : {}), page: (currentPage - 1).toString() }).toString()}`}
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
                    href={`/partidos?${new URLSearchParams({ ...(query ? { q: query } : {}), page: (currentPage + 1).toString() }).toString()}`}
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
            <h3 className="text-xl font-black text-zinc-900 mb-2">No hay resultados para &quot;{query}&quot;</h3>
            <p className="text-zinc-500 font-medium">Prueba buscando otro equipo o competencia.</p>
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
              <GoalsAnalysis filters={{ q: query }} />
              <GoalMethodAnalysis filters={{ q: query }} />
            </div>
          </AccessControl>
        </section>
      </section>
    </div>
  );
}
