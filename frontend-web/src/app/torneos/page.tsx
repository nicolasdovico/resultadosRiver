import Link from "next/link";
import { Star, ChevronRight, Trophy, TrendingUp, Info, Calendar } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";
import { cookies } from "next/headers";

interface Torneo {
  tor_id: number;
  tor_desc: string;
  tor_nivel: string;
  tor_anio?: number;
}

export default async function TorneosPage({
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

  const response = await customInstance<{ data: Torneo[], meta?: { total: number, last_page: number } }>({
    url: '/v1/torneos',
    method: 'GET',
    params: { 
      q: query,
      page: currentPage,
      limit: (isLoggedIn && !isPremium && !query) ? 10 : 15
    },
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  
  let allTorneos: Torneo[] = response.data || [];
  const totalResults = (response as any).meta?.total || allTorneos.length;
  const lastPage = (response as any).meta?.last_page || 1;
  
  // Restriction logic for Free users
  let visibleTorneos = allTorneos;
  let isRestricted = false;
  let shownCount = allTorneos.length;

  if (!isPremium) {
    if (query) {
      // Logic for searches: if total <= 10, show half. If > 10, show 10.
      let limit = 10;
      if (totalResults <= 10) {
        limit = Math.max(1, Math.floor(totalResults * 0.5));
      }
      
      if (totalResults > limit) {
        visibleTorneos = allTorneos.slice(0, limit);
        shownCount = limit;
        isRestricted = true;
      }
    } else {
      // Default list logic: limit to 10
      const limit = 10;
      if (totalResults > limit) {
        visibleTorneos = allTorneos.slice(0, limit);
        shownCount = limit;
        isRestricted = true;
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <Star size={24} />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Torneos</h1>
          </div>
          <p className="text-zinc-500 font-medium max-w-xl">
            La vitrina del Más Grande. Desde copas internacionales hasta torneos locales.
          </p>
        </div>
        <div className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center">
          <Trophy className="mr-2" size={14} />
          {query ? `${totalResults} encontrados` : `Competiciones`}
        </div>
      </div>

      {/* Guest View: Major Trophies Teaser */}
      {!query && !isLoggedIn && (
        <section className="mb-16">
          <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center tracking-tight uppercase">
            <Trophy className="mr-3 text-red-600" size={20} />
            Grandes Competencias
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'COPA LIBERTADORES', count: 4, color: 'bg-zinc-900', text: 'text-white' },
              { name: 'TORNEO LOCAL', count: 37, color: 'bg-white', text: 'text-zinc-900' },
              { name: 'COPA ARGENTINA', count: 3, color: 'bg-red-600', text: 'text-white' },
              { name: 'INTERCONTINENTAL', count: 1, color: 'bg-zinc-100', text: 'text-zinc-900' },
            ].map((t) => (
              <div key={t.name} className={`${t.color} ${t.text} p-8 rounded-[32px] border border-zinc-100 shadow-sm flex flex-col justify-between h-48 group`}>
                <h3 className="font-black text-sm leading-tight tracking-tight uppercase">{t.name}</h3>
                <div>
                  <span className="text-5xl font-black group-hover:scale-110 transition-transform block">{t.count}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Títulos Ganados</span>
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
            {isLoggedIn && !query && !isPremium ? 'Últimos 10 Torneos' : 'Lista de Competiciones'}
          </h2>
          {isLoggedIn && (
            <SearchBar placeholder="Buscar torneo por nombre..." className="w-full md:max-w-md" />
          )}
        </div>

        {/* Premium Restriction Banner - ONLY FOR FREE USERS */}
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
                  <>Mostrando los últimos <span className="font-black">{shownCount}</span> torneos de un total de <span className="font-black">{totalResults}</span>.</>
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
        
        {visibleTorneos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleTorneos.map((torneo) => (
                <Link 
                  key={torneo.tor_id} 
                  href={`/torneos/${torneo.tor_id}`}
                  className="bg-white p-6 rounded-3xl border border-zinc-100 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/5 transition-all group flex flex-col relative overflow-hidden min-h-[140px]"
                >
                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-100 group-hover:bg-red-600 transition-colors" />
                  
                  <div className="flex justify-between items-center mb-4 ml-2">
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {torneo.tor_nivel}
                    </span>
                  </div>
                  
                  <div className="ml-2 flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-black text-zinc-900 group-hover:text-red-600 transition-colors tracking-tight uppercase italic leading-tight mb-2">
                      {torneo.tor_desc}
                    </h3>
                    {torneo.tor_anio && (
                      <div className="flex items-center text-zinc-400 text-[11px] font-black uppercase tracking-widest">
                        <Calendar size={12} className="mr-1.5 text-red-500" />
                        Año {torneo.tor_anio}
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <ChevronRight size={20} className="text-red-600" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination - ONLY FOR PREMIUM USERS (OR WHEN NOT RESTRICTED) */}
            {!isRestricted && lastPage > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                {currentPage > 1 ? (
                  <Link 
                    href={`/torneos?${new URLSearchParams({ ...(query ? { q: query } : {}), page: (currentPage - 1).toString() }).toString()}`}
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
                    href={`/torneos?${new URLSearchParams({ ...(query ? { q: query } : {}), page: (currentPage + 1).toString() }).toString()}`}
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
            <Star className="mx-auto mb-4 text-zinc-300" size={48} />
            <h3 className="text-xl font-black text-zinc-900 mb-2">No encontramos el torneo "{query}"</h3>
            <p className="text-zinc-500 font-medium">Prueba con otro nombre o año.</p>
          </div>
        )}
      </section>
    </div>
  );
}
