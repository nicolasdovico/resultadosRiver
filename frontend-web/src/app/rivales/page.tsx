import { ShieldAlert, Target, Zap, Users, Search, X, Info, Star, Activity, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";
import { cookies } from "next/headers";
import Image from "next/image";

interface Rival {
  ri_id: number;
  ri_desc: string;
  escudo_url?: string | null;
  stats?: {
    pj: number;
    pg: number;
    pe: number;
    pp: number;
    gf: number;
    gc: number;
    dg: number;
    puntos: number;
    efectividad: number;
  };
}

export default async function RivalesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const userRole = cookieStore.get("user_role")?.value;
  const isLoggedIn = !!token;
  const isPremium = userRole === "premium";
  
  const currentTier: "guest" | "registered" | "premium" = isPremium ? "premium" : (isLoggedIn ? "registered" : "guest");
  
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.toUpperCase() : "";
  const letter = typeof params.letra === "string" ? params.letra.toUpperCase() : "";
  let currentPage = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  // Force page 1 for free users
  if (isLoggedIn && !isPremium) {
    currentPage = 1;
  }

  const fetchOptions = { headers: token ? { "Authorization": `Bearer ${token}` } : {} } as any;

  let visibleRivales: Rival[] = [];
  let totalResults = 0;
  let lastPage = 1;

  if (query || letter) {
    const response = await customInstance<{ data: Rival[], meta?: any }>({
      url: "/v1/rivales",
      method: "GET",
      params: { 
        q: query, 
        letter: letter,
        page: currentPage,
        limit: 25
      },
      ...fetchOptions
    });
    
    visibleRivales = response.data || [];
    totalResults = response.meta?.total || visibleRivales.length;
    lastPage = response.meta?.last_page || 1;
  }

  // Fetch Classic Rivals for the hero section
  let classicRivales: Rival[] = [];
  if (!query && !letter) {
    try {
        const classicsResponse = await customInstance<{ data: Rival[] }>({
            url: "/v1/rivales/classics",
            method: "GET",
            ...fetchOptions
        });
        classicRivales = classicsResponse.data || [];
        
        // Custom sort to match the traditional order: Boca, Independiente, Racing, San Lorenzo
        const order = [15, 10, 20, 16];
        classicRivales.sort((a, b) => order.indexOf(a.ri_id) - order.indexOf(b.ri_id));
    } catch (e) {
        console.error("Error fetching classics", e);
    }
  }

  // Restriction logic for non-premium users (max 15)
  let shownCount = visibleRivales.length;
  let isRestricted = false;

  if (isLoggedIn && !isPremium && (query || letter)) {
    const limit = 15;
    if (totalResults > limit) {
      if (visibleRivales.length > limit) {
        visibleRivales = visibleRivales.slice(0, limit);
        shownCount = limit;
      } else {
        shownCount = visibleRivales.length;
      }
      isRestricted = true;
    }
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none rotate-12">
          <ShieldAlert size={400} />
        </div>
        
        <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-200">
                  <ShieldAlert size={28} />
                </div>
                <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase italic">
                  Archivo de <span className="text-red-600">Rivales</span>
                </h1>
              </div>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed">
                El historial completo frente a cada adversario. 
                Goles, rachas y encuentros inolvidables a través de las décadas.
              </p>
            </div>
            
            <div className="flex items-center bg-zinc-900 text-white px-8 py-4 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-xl border-4 border-white">
              <Activity className="mr-3 text-red-500" size={18} />
              {query || letter ? `${totalResults} encontrados` : "Archivo Histórico"}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Historial Clásico - Dinámico */}
        {!query && !letter && classicRivales.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic flex items-center">
                <Target className="mr-4 text-red-600" size={28} />
                Historial Clásico
              </h2>
              <div className="h-px flex-1 bg-zinc-200 mx-8 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {classicRivales.map((r) => {
                const diff = (r.stats?.pg || 0) - (r.stats?.pp || 0);
                const diffFormatted = diff > 0 ? `+${diff}` : diff.toString();
                const rivalName = r.ri_desc.replace("CLUB ATLETICO ", "");

                return (
                    <Link 
                        key={r.ri_id} 
                        href={`/rivales/${r.ri_id}`}
                        className="bg-zinc-900 p-8 rounded-[40px] text-white relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 border border-zinc-800 hover:border-red-600 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            {r.escudo_url ? (
                                <div className="w-8 h-8 relative shrink-0">
                                    <Image src={r.escudo_url} alt="" fill className="object-contain" unoptimized />
                                </div>
                            ) : (
                                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                                    <Zap size={14} className="text-zinc-500" />
                                </div>
                            )}
                            <h3 className="font-black text-zinc-400 text-[10px] uppercase tracking-widest truncate">{rivalName}</h3>
                        </div>

                        <div className="flex items-end justify-between relative z-10">
                            <span className={`text-4xl font-black ${diff > 0 ? 'text-white' : diff < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                                {diffFormatted}
                            </span>
                            <Zap className={`${diff >= 0 ? 'text-green-500' : 'text-red-600'} mb-1`} size={24} />
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            {diff >= 0 ? "Partidos de Ventaja" : "Partidos de Desventaja"}
                        </p>
                    </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="relative">
          {/* Header de Búsqueda / Navegación */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">
                {letter ? `Letra ${letter}` : query ? "Búsqueda" : "Explorar"}
              </h2>
              {(letter || query) && (
                <Link 
                  href="/rivales"
                  className="flex items-center space-x-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <X size={12} />
                  <span>Cerrar</span>
                </Link>
              )}
            </div>
            <div className="relative w-full md:max-w-md">
              <SearchBar placeholder="Buscar rival..." className="w-full" />
            </div>
          </div>

          {/* Premium Restriction Banner */}
          {isRestricted && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm shadow-yellow-900/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-yellow-600 shrink-0 shadow-sm">
                  <Info size={24} />
                </div>
                <p className="text-yellow-900 font-medium text-sm md:text-base">
                  Mostrando <span className="font-black">{shownCount}</span> de <span className="font-black">{totalResults}</span> rivales.{" "}
                  Los socios <span className="font-black">Premium</span> acceden al historial completo y analítica avanzada.
                </p>
              </div>
              <Link href="/premium" className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center whitespace-nowrap">
                <Star className="mr-2 fill-yellow-400 text-yellow-400" size={14} />
                Hacerme Premium
              </Link>
            </div>
          )}

          {/* Vista 1: Cuadrícula Alfabética */}
          {!query && !letter ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-3">
              {alphabet.map((l) => (
                <Link
                  key={l}
                  href={`/rivales?letra=${l}`}
                  className="aspect-square bg-white rounded-2xl border border-zinc-100 flex items-center justify-center group hover:bg-zinc-900 hover:border-zinc-900 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-zinc-900/10"
                >
                  <span className="text-xl font-black text-zinc-900 group-hover:text-white transition-colors italic tabular-nums">
                    {l}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            /* Vista 2: Resultados */
            <>
              {visibleRivales.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {visibleRivales.map((rival) => (
                      <Link 
                        key={rival.ri_id}
                        href={`/rivales/${rival.ri_id}`}
                        className="bg-white p-6 rounded-[32px] border border-zinc-100 flex flex-col items-center justify-center group hover:border-zinc-900 transition-all duration-300 text-center aspect-square shadow-sm hover:shadow-xl hover:shadow-zinc-900/5 relative overflow-hidden"
                      >
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 font-black text-2xl mb-4 group-hover:bg-red-50 group-hover:text-red-600 transition-all uppercase relative overflow-hidden border-2 border-transparent group-hover:border-red-100">
                          {rival.escudo_url ? (
                            <Image 
                              src={rival.escudo_url} 
                              alt={rival.ri_desc} 
                              width={60} 
                              height={60} 
                              className="object-contain group-hover:scale-110 transition-transform duration-500"
                              unoptimized
                            />
                          ) : (
                            <span className="group-hover:scale-110 transition-transform duration-500">{rival.ri_desc?.charAt(0) || "?"}</span>
                          )}
                        </div>
                        <span className="font-black text-zinc-700 tracking-tight text-[10px] uppercase leading-tight line-clamp-2 px-2 group-hover:text-zinc-900 transition-colors">
                          {rival.ri_desc}
                        </span>
                        
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight size={14} className="text-red-600" />
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination - Only for Premium */}
                  {!isRestricted && lastPage > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-12">
                      {currentPage > 1 ? (
                        <Link 
                          href={`/rivales?${new URLSearchParams({ 
                            ...(query ? { q: query } : {}), 
                            ...(letter ? { letra: letter } : {}),
                            page: (currentPage - 1).toString() 
                          }).toString()}`}
                          className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 font-bold text-sm hover:border-zinc-900 hover:text-white transition-colors"
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
                          href={`/rivales?${new URLSearchParams({ 
                            ...(query ? { q: query } : {}), 
                            ...(letter ? { letra: letter } : {}),
                            page: (currentPage + 1).toString() 
                          }).toString()}`}
                          className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 font-bold text-sm hover:border-zinc-900 hover:text-white transition-colors"
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
                <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-zinc-100 shadow-inner">
                  <Search className="mx-auto mb-6 text-zinc-200" size={64} />
                  <h3 className="text-2xl font-black text-zinc-900 mb-2 uppercase italic tracking-tighter">
                    No encontramos a {letter ? `la letra "${letter}"` : `"${query}"`}
                  </h3>
                  <p className="text-zinc-400 font-medium max-w-sm mx-auto">
                    Revisa el nombre o intenta con otro rival.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Guest Access Control */}
          {currentTier === "guest" && !query && !letter && (
            <div className="mt-12 p-1 bg-gradient-to-r from-zinc-800 to-zinc-950 rounded-[40px]">
              <AccessControl tier={currentTier} requiredTier="registered" className="h-64 rounded-[38px]" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
