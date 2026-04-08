import { getJugadores } from "@/api/generated/endpoints/jugadores/jugadores";
import Link from "next/link";
import { Users, ChevronRight, Star, Trophy, Activity, Search, X, Info, Shield } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";
import Image from "next/image";
import { cookies } from "next/headers";
import { sanitizeImageUrl } from "@/utils/image";

interface Jugador {
  pl_id: number;
  pl_apno: string;
  pl_foto?: string | null;
  goles_count?: number;
}

export default async function JugadoresPage({
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
  const query = typeof params.q === "string" ? params.q : "";
  const letter = typeof params.letra === "string" ? params.letra.toUpperCase() : "";
  let currentPage = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  // Force page 1 for free users
  if (isLoggedIn && !isPremium) {
    currentPage = 1;
  }

  const fetchOptions = { headers: token ? { "Authorization": `Bearer ${token}` } : {} } as any;

  // Solo buscamos jugadores si hay una query o una letra seleccionada
  let visibleJugadores: Jugador[] = [];
  let totalResults = 0;
  let lastPage = 1;

  if (query || letter) {
    const response = await customInstance<{ data: Jugador[], meta?: any }>({
      url: "/v1/jugadores",
      method: "GET",
      params: { 
        q: query, 
        letter: letter,
        page: currentPage,
        limit: 25
      },
      ...fetchOptions
    });
    
    // @ts-expect-error - meta is not fully typed
    visibleJugadores = response.data || [];
    // @ts-expect-error
    totalResults = response.meta?.total || visibleJugadores.length;
    // @ts-expect-error
    lastPage = response.meta?.last_page || 1;
  }

  // Restriction logic for non-premium users
  let shownCount = visibleJugadores.length;
  let isRestricted = false;

  if (isLoggedIn && !isPremium && (query || letter)) {
    const limit = Math.max(5, Math.floor(totalResults * 0.5));
    if (totalResults > limit) {
      if (limit < 25) {
        visibleJugadores = visibleJugadores.slice(0, limit);
        shownCount = limit;
      } else {
        shownCount = 25; // Full first page
      }
      isRestricted = true;
    }
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-24">
      <div className="bg-white border-b border-zinc-100 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none rotate-12">
          <Users size={400} />
        </div>
        
        <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                  <Users size={28} />
                </div>
                <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase italic">
                  Archivo de <span className="text-red-600">Figuras</span>
                </h1>
              </div>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed">
                Explora el registro histórico de los protagonistas que defendieron la banda roja. 
                Goleadores, leyendas y guerreros del Monumental.
              </p>
            </div>
            
            <div className="flex items-center bg-zinc-900 text-white px-8 py-4 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-xl border-4 border-white">
              <Activity className="mr-3 text-red-500" size={18} />
              {query || letter ? `${totalResults} encontrados` : "Directorio Alfabético"}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Top 5 Goleadores - Solo en la vista inicial */}
        {!query && !letter && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic flex items-center">
                <Trophy className="mr-4 text-red-600" size={28} />
                Goleadores Inmortales
              </h2>
              <div className="h-px flex-1 bg-zinc-200 mx-8 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { name: "ÁNGEL LABRUNA", goals: 317, pos: 1 },
                { name: "OSCAR MAS", goals: 217, pos: 2 },
                { name: "BERNABÉ FERREYRA", goals: 202, pos: 3 },
                { name: "JOSÉ MANUEL MORENO", goals: 184, pos: 4 },
                { name: "NORBERTO ALONSO", goals: 158, pos: 5 },
              ].map((top) => (
                <div key={top.pos} className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-red-600 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute -right-4 -bottom-4 text-8xl font-black text-zinc-50 group-hover:text-red-50/50 transition-colors pointer-events-none italic">
                    #{top.pos}
                  </div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-black text-xs mb-4">
                      {top.pos}º
                    </div>
                    <h3 className="font-black text-zinc-900 text-lg mb-2 leading-none uppercase tracking-tight">{top.name}</h3>
                    <div className="flex items-end space-x-1">
                      <span className="text-3xl font-black text-red-600">{top.goals}</span>
                      <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1.5">Goles</span>
                    </div>
                  </div>
                </div>
              ))}
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
                  href="/jugadores"
                  className="flex items-center space-x-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <X size={12} />
                  <span>Cerrar</span>
                </Link>
              )}
            </div>
            <div className="relative w-full md:max-w-md">
              <SearchBar placeholder="Refinar búsqueda..." className="w-full" />
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
                  Mostrando <span className="font-black">{shownCount}</span> de <span className="font-black">{totalResults}</span> jugadores encontrados.{" "}
                  Los socios <span className="font-black">Premium</span> acceden al archivo histórico completo y paginación ilimitada.
                </p>
              </div>
              <Link href="/premium" className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center whitespace-nowrap">
                <Star className="mr-2 fill-yellow-400 text-yellow-400" size={14} />
                Hacerme Premium
              </Link>
            </div>
          )}

          {/* Vista 1: Cuadrícula Alfabética - Tamaño Reducido */}
          {!query && !letter ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-3">
              {alphabet.map((l) => (
                <Link
                  key={l}
                  href={`/jugadores?letra=${l}`}
                  className="aspect-square bg-white rounded-2xl border border-zinc-100 flex items-center justify-center group hover:bg-red-600 hover:border-red-600 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-red-900/20"
                >
                  <span className="text-xl font-black text-zinc-900 group-hover:text-white transition-colors italic tabular-nums">
                    {l}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            /* Vista 2: Resultados del Directorio / Búsqueda */
            <>
              {visibleJugadores.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {visibleJugadores.map((jugador) => {
                      const fotoUrl = sanitizeImageUrl(jugador.pl_foto);
                      return (
                        <Link 
                          key={jugador.pl_id}
                          href={`/jugadores/${jugador.pl_id}`}
                          className="bg-white p-6 rounded-[36px] border border-zinc-100 flex flex-col group hover:border-red-600 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-red-900/5"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-xl uppercase group-hover:bg-red-600 transition-colors shadow-lg shadow-zinc-200 overflow-hidden relative border-2 border-white">
                              {fotoUrl ? (
                                <>
                                  <Image 
                                    src={fotoUrl} 
                                    alt="" 
                                    fill 
                                    unoptimized
                                    className={`object-cover object-top transition-all duration-500 ${!isPremium ? 'blur-[3px] grayscale opacity-50' : ''}`} 
                                  />
                                  {!isPremium && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                      <Shield size={10} className="text-white" />
                                    </div>
                                  )}
                                </>
                              ) : (
                                jugador.pl_apno ? jugador.pl_apno.charAt(0) : "?"
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ID Registro</span>
                              <span className="text-xs font-black text-zinc-900 tabular-nums"># {jugador.pl_id}</span>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <h3 className="font-black text-zinc-900 tracking-tight group-hover:text-red-600 transition-colors text-lg uppercase leading-tight mb-4">
                              {jugador.pl_apno}
                            </h3>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Historial</span>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-black text-zinc-900">{jugador.goles_count || 0}</span>
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Goles</span>
                                </div>
                              </div>
                              <div className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                                <ChevronRight size={16} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {!isRestricted && lastPage > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-12">
                      {currentPage > 1 ? (
                        <Link 
                          href={`/jugadores?${new URLSearchParams({ 
                            ...(query ? { q: query } : {}), 
                            ...(letter ? { letra: letter } : {}),
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
                          href={`/jugadores?${new URLSearchParams({ 
                            ...(query ? { q: query } : {}), 
                            ...(letter ? { letra: letter } : {}),
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
                <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-zinc-100 shadow-inner">
                  <Search className="mx-auto mb-6 text-zinc-200" size={64} />
                  <h3 className="text-2xl font-black text-zinc-900 mb-2 uppercase italic tracking-tighter">
                    No hay registros para {letter ? `la letra "${letter}"` : `"${query}"`}
                  </h3>
                  <p className="text-zinc-400 font-medium max-w-sm mx-auto">
                    Verifica la ortografía o intenta buscar por apellido paterno solamente.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Access Control for Guests */}
          {currentTier === "guest" && !query && !letter && (
            <div className="mt-12 p-1 bg-gradient-to-r from-red-600 to-zinc-900 rounded-[40px]">
              <AccessControl tier={currentTier} requiredTier="registered" className="h-64 rounded-[38px]" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
