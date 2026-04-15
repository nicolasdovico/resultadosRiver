import Link from "next/link";
import { UserRound, ChevronRight, Award, Percent, Users, Search, X, Info, Star, Activity, Lock, Shield } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";
import { cookies } from "next/headers";
import Image from "next/image";
import { sanitizeImageUrl } from "@/utils/image";

interface Tecnico {
  id_tecnicos: number;
  tec_ape_nom: string;
  tec_foto?: string | null;
  desde: string;
  hasta: string;
  cargo: string;
  partidos_count?: number;
}

export default async function TecnicosPage({
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

  let visibleTecnicos: Tecnico[] = [];
  let totalResults = 0;
  let lastPage = 1;

  if (query || letter) {
    const response = await customInstance<{ data: Tecnico[], meta?: any }>({
      url: "/v1/tecnicos",
      method: "GET",
      params: { 
        q: query, 
        letter: letter,
        page: currentPage,
        limit: 25
      },
      ...fetchOptions
    });
    
    visibleTecnicos = response.data || [];
    totalResults = response.meta?.total || visibleTecnicos.length;
    lastPage = response.meta?.last_page || 1;
  }

  // Restriction logic for non-premium users (max 15 as requested)
  let shownCount = visibleTecnicos.length;
  let isRestricted = false;

  if (isLoggedIn && !isPremium && (query || letter)) {
    const limit = 15;
    if (totalResults > limit) {
      if (visibleTecnicos.length > limit) {
        visibleTecnicos = visibleTecnicos.slice(0, limit);
        shownCount = limit;
      } else {
        shownCount = visibleTecnicos.length;
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
          <UserRound size={400} />
        </div>
        
        <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-200">
                  <UserRound size={28} />
                </div>
                <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase italic">
                  Archivo de <span className="text-red-600">Técnicos</span>
                </h1>
              </div>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed">
                Desde los fundadores hasta los ciclos más gloriosos. 
                Explora la trayectoria y efectividad de los estrategas de la banda roja.
              </p>
            </div>
            
            <div className="flex items-center bg-zinc-900 text-white px-8 py-4 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-xl border-4 border-white">
              <Activity className="mr-3 text-red-500" size={18} />
              {query || letter ? `${totalResults} encontrados` : "Directorio Histórico"}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Ciclos Destacados - Solo en vista inicial */}
        {!query && !letter && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic flex items-center">
                <Award className="mr-4 text-red-600" size={28} />
                Ciclos de Gloria
              </h2>
              <div className="h-px flex-1 bg-zinc-200 mx-8 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'GALLARDO, MARCELO', period: '2014 - 2022', titles: 14, winRate: '54%' },
                { name: 'RAMÓN DÍAZ', period: '1995 - 2014', titles: 9, winRate: '51%' },
                { name: 'LABRUNA, ÁNGEL', period: '1975 - 1981', titles: 6, winRate: '48%' },
              ].map((cycle) => (
                <div key={cycle.name} className="bg-zinc-900 p-8 rounded-[40px] text-white relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 border border-zinc-800 hover:border-red-600 shadow-2xl">
                  <Award className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-red-600/20 transition-colors" size={160} />
                  <div className="relative z-10">
                    <h3 className="font-black text-xl mb-1 leading-tight uppercase italic">{cycle.name}</h3>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-8">{cycle.period}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-4xl font-black text-red-600">{cycle.titles}</span>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Títulos</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-zinc-300">{cycle.winRate}</span>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Efectividad</p>
                      </div>
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
                  href="/tecnicos"
                  className="flex items-center space-x-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <X size={12} />
                  <span>Cerrar</span>
                </Link>
              )}
            </div>
            <div className="relative w-full md:max-w-md">
              <SearchBar placeholder="Buscar DT por apellido..." className="w-full" />
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
                  Mostrando <span className="font-black">{shownCount}</span> de <span className="font-black">{totalResults}</span> técnicos.{" "}
                  Los socios <span className="font-black">Premium</span> acceden al archivo completo y análisis de eficacia.
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
                  href={`/tecnicos?letra=${l}`}
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
              {visibleTecnicos.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleTecnicos.map((tecnico) => (
                      <Link 
                        key={tecnico.id_tecnicos}
                        href={`/tecnicos/${tecnico.id_tecnicos}`}
                        className="bg-white p-8 rounded-[40px] border border-zinc-100 flex flex-col group hover:border-zinc-900 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-zinc-900/5 overflow-hidden"
                      >
                        <div className="flex items-start justify-between mb-8">
                          <div className="w-24 h-32 md:w-32 md:h-40 bg-zinc-900 text-white rounded-[24px] flex items-center justify-center font-black text-2xl uppercase group-hover:bg-red-600 transition-all duration-500 shadow-lg relative overflow-hidden shrink-0">
                            {tecnico.tec_foto ? (
                              <>
                                <Image 
                                  src={sanitizeImageUrl(tecnico.tec_foto)} 
                                  alt="" 
                                  fill 
                                  unoptimized
                                  className={`object-cover object-top transition-all duration-700 ${!isPremium ? 'blur-xl grayscale scale-110' : 'group-hover:scale-110'}`} 
                                />
                                {!isPremium && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-sm">
                                    <Lock size={20} className="text-red-500" />
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="group-hover:scale-110 transition-transform duration-500">{tecnico.tec_ape_nom?.[0] || "?"}</span>
                            )}
                          </div>
                          <div className="flex flex-col text-right">
                             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Partidos</span>
                             <span className="text-xl font-black text-zinc-900 tabular-nums">{tecnico.partidos_count || 0}</span>
                             
                             <div className="mt-4 bg-zinc-50 rounded-2xl p-3 border border-zinc-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                                <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-tighter mb-1">Cargo</span>
                                <span className="block text-[10px] font-black text-zinc-900 uppercase italic">{tecnico.cargo || 'Oficial'}</span>
                             </div>
                          </div>
                        </div>
                        
                        <h3 className="font-black text-zinc-900 tracking-tight group-hover:text-red-600 transition-colors text-xl uppercase leading-tight mb-6">
                          {tecnico.tec_ape_nom}
                        </h3>
                        
                        <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Periodo del Ciclo</span>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-zinc-600">Desde: {tecnico.desde ? tecnico.desde.split('-').reverse().join('-') : 'N/A'}</span>
                              <span className="text-[10px] font-bold text-zinc-600">Hasta: {tecnico.hasta ? tecnico.hasta.split('-').reverse().join('-') : 'Actualidad'}</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination - Only for Premium */}
                  {!isRestricted && lastPage > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-12">
                      {currentPage > 1 ? (
                        <Link 
                          href={`/tecnicos?${new URLSearchParams({ 
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
                          href={`/tecnicos?${new URLSearchParams({ 
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
                    No hay registros para {letter ? `la letra "${letter}"` : `"${query}"`}
                  </h3>
                  <p className="text-zinc-400 font-medium max-w-sm mx-auto">
                    Verifica la ortografía o intenta buscar por apellido solamente.
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

        {/* Premium Analysis Section */}
        <section className="mt-32">
          <div className="flex flex-col mb-12">
            <h2 className="text-4xl font-black text-zinc-900 mb-4 tracking-tighter uppercase italic">Análisis de Eficacia</h2>
            <p className="text-zinc-500 font-medium text-lg">Comparativa histórica de efectividad por ciclos de conducción.</p>
          </div>

          <AccessControl tier={currentTier} requiredTier="premium" className="rounded-[48px] overflow-hidden shadow-2xl border border-zinc-100">
            <div className="bg-white p-12 min-h-[400px]">
              <div className="flex items-center space-x-6 mb-16">
                <div className="w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Percent size={32} />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-zinc-900 tracking-tight uppercase italic">Ranking Histórico</h3>
                  <p className="text-zinc-500 font-medium">Top 5 de directores técnicos por porcentaje de efectividad.</p>
                </div>
              </div>
              
              <div className="space-y-10">
                {[
                  { name: 'EMERICO HIRSCHL', rate: 68, color: 'bg-red-600' },
                  { name: 'RENATO CESARINI', rate: 64, color: 'bg-red-500' },
                  { name: 'MINNELLA, JOSÉ MARÍA', rate: 61, color: 'bg-red-400' },
                  { name: 'DAPUENTE, FRANCISCO', rate: 59, color: 'bg-zinc-400' },
                  { name: 'GALLARDO, MARCELO', rate: 54, color: 'bg-zinc-300' },
                ].map((dt) => (
                  <div key={dt.name} className="group">
                    <div className="flex justify-between text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 group-hover:text-zinc-900 transition-colors">
                      <span className="uppercase italic">{dt.name}</span>
                      <span className="text-red-600">{dt.rate}%</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-50 rounded-full overflow-hidden shadow-inner p-0.5">
                      <div className={`h-full ${dt.color} rounded-full transition-all duration-1000 group-hover:brightness-110 shadow-sm`} style={{ width: `${dt.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AccessControl>
        </section>
      </div>
    </div>
  );
}
