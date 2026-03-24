import { getPartidos } from "@/api/generated/endpoints/partidos/partidos";
import Link from "next/link";
import { Trophy, ChevronRight, Calendar, BarChart3, Clock } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";

interface Partido {
  fecha: string;
  rival: {
    ri_desc: string;
  };
  torneo: {
    tor_desc: string;
    tor_nivel: string;
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
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';
  
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';

  // Pass search query directly to API
  const response = await getPartidos({ q: query } as any);
  // @ts-expect-error - Resource data structure is not fully typed in SDK
  const visiblePartidos: Partido[] = (response as { data?: Partido[] }).data || [];

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
          {query ? `${visiblePartidos.length} encontrados` : `Archivo Completo`}
        </div>
      </div>

      {/* Guest View: Recent Results Teaser */}
      {!query && (
        <section className="mb-16">
          <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center tracking-tight uppercase">
            <Clock className="mr-3 text-red-600" size={20} />
            Resultados Recientes
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visiblePartidos.slice(0, 4).map((p) => (
              <div key={p.fecha} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date(p.fecha).toLocaleDateString('es-AR')}</span>
                  <span className="font-black text-zinc-800 tracking-tight line-clamp-1">{p.rival?.ri_desc}</span>
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
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Archivo Histórico</h2>
          {currentTier !== 'guest' && (
            <SearchBar placeholder="Buscar por rival o torneo..." className="w-full md:max-w-md" />
          )}
        </div>

        {visiblePartidos.length > 0 ? (
          <div className="grid gap-4">
            {visiblePartidos.map((partido) => (
              <Link 
                key={partido.fecha} 
                href={`/partidos/${partido.fecha}`}
                className="bg-white p-6 rounded-[32px] border border-zinc-100 hover:border-red-200 transition-all flex items-center group shadow-sm"
              >
                <div className="flex flex-col w-32 shrink-0">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                    {new Date(partido.fecha).toLocaleDateString('es-AR')}
                  </span>
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-tight line-clamp-1">
                    {partido.torneo?.tor_desc}
                  </span>
                </div>
                
                <div className="flex items-center flex-1 px-8">
                  <div className="flex-1 text-right font-black text-zinc-800 tracking-tight text-xs md:text-base">River Plate</div>
                  <div className="mx-6 flex items-center">
                    <span className={`text-2xl font-black px-4 py-1 rounded-xl ${partido.resultado === 'G' ? 'bg-green-50 text-green-600' : partido.resultado === 'P' ? 'bg-red-50 text-red-600' : 'bg-zinc-50 text-zinc-500'}`}>
                      {partido.goles_river} - {partido.goles_rival}
                    </span>
                  </div>
                  <div className="flex-1 text-left font-black text-zinc-800 tracking-tight text-xs md:text-base">{partido.rival?.ri_desc}</div>
                </div>

                <div className="flex items-center text-zinc-300 group-hover:text-red-500 transition-colors">
                  <ChevronRight size={24} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
            <Trophy className="mx-auto mb-4 text-zinc-300" size={48} />
            <h3 className="text-xl font-black text-zinc-900 mb-2">No hay resultados para "{query}"</h3>
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
            <div className="bg-white p-10 min-h-[400px]">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-red-600">
                    <BarChart3 size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-zinc-900 tracking-tight uppercase">Goles por Tiempo</h3>
                    <p className="text-zinc-500 font-medium text-sm">Cuándo marca River sus goles históricamente.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-8">
                {[
                  { label: '0\' - 15\'', value: 15, color: 'bg-zinc-200' },
                  { label: '16\' - 30\'', value: 25, color: 'bg-zinc-400' },
                  { label: '31\' - 45\'', value: 35, color: 'bg-red-500' },
                  { label: '46\' - 60\'', value: 20, color: 'bg-zinc-400' },
                  { label: '61\' - 75\'', value: 30, color: 'bg-red-600' },
                  { label: '76\' - 90\'', value: 45, color: 'bg-red-700' },
                ].map((bar) => (
                  <div key={bar.label} className="flex items-center">
                    <span className="w-20 text-xs font-black text-zinc-500 uppercase">{bar.label}</span>
                    <div className="flex-1 h-4 bg-zinc-50 rounded-full overflow-hidden mx-4">
                      <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${bar.value}%` }} />
                    </div>
                    <span className="w-12 text-right text-xs font-black text-zinc-900">{bar.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </AccessControl>
        </section>
      </section>
    </div>
  );
}
