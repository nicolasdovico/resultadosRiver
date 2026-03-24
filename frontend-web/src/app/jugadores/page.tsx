import { getJugadores } from "@/api/generated/endpoints/jugadores/jugadores";
import Link from "next/link";
import { Users, ChevronRight, TrendingUp, Star } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";

interface Jugador {
  pl_id: number;
  pl_apno: string;
}

export default async function JugadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';
  
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';

  // Manual call because Orval might not have generated the 'q' param in the SDK signature
  const response = await customInstance<{ data: Jugador[] }>({
    url: '/v1/jugadores',
    method: 'GET',
    params: { q: query }
  });
  
  const visibleJugadores: Jugador[] = response.data || [];
  
  const totalDisplay = query ? visibleJugadores.length : 2900; 

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Jugadores</h1>
          </div>
          <p className="text-zinc-500 font-medium max-w-xl">
            Explora las figuras que vistieron la banda roja. Goleadores, ídolos y leyendas del club.
          </p>
        </div>
        <div className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center">
          <Users className="mr-2" size={14} />
          {query ? `${visibleJugadores.length} encontrados` : `${totalDisplay} Registrados`}
        </div>
      </div>

      {/* Guest View: Top Goleadores Teaser */}
      {!query && (
        <section className="mb-16">
          <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center tracking-tight uppercase">
            <Star className="mr-3 fill-red-600 text-red-600" size={20} />
            Máximos Goleadores Históricos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { name: 'ÁNGEL LABRUNA', goals: 317, pos: 1 },
              { name: 'OSCAR MAS', goals: 217, pos: 2 },
              { name: 'BERNABÉ FERREYRA', goals: 202, pos: 3 },
              { name: 'JOSÉ MANUEL MORENO', goals: 184, pos: 4 },
              { name: 'NORBERTO ALONSO', goals: 158, pos: 5 },
            ].map((top) => (
              <div key={top.pos} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-red-200 transition-all">
                <div className="text-5xl font-black text-zinc-50 absolute -right-2 -bottom-2 group-hover:text-red-50 transition-colors">#{top.pos}</div>
                <h3 className="font-black text-zinc-900 text-sm mb-1 leading-tight relative z-10 uppercase">{top.name}</h3>
                <p className="text-red-600 font-black text-2xl relative z-10">{top.goals} <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Goles</span></p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main List with Access Control */}
      <section className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Archivo Completo</h2>
          {currentTier !== 'guest' && (
            <SearchBar placeholder="Buscar por apellido o nombre..." className="w-full md:max-w-md" />
          )}
        </div>

        {visibleJugadores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleJugadores.map((jugador) => (
              <Link 
                key={jugador.pl_id}
                href={`/jugadores/${jugador.pl_id}`}
                className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center justify-between group hover:border-red-200 transition-all shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 font-black text-xl uppercase group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    {jugador.pl_apno ? jugador.pl_apno.charAt(0) : '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-zinc-800 tracking-tight group-hover:text-red-600 transition-colors text-sm uppercase">
                      {jugador.pl_apno}
                    </span>
                    <div className="flex items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                      <span className="mr-2 text-[8px]">ID: {jugador.pl_id}</span>
                      <ChevronRight size={10} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
            <Users className="mx-auto mb-4 text-zinc-300" size={48} />
            <h3 className="text-xl font-black text-zinc-900 mb-2">No encontramos a "{query}"</h3>
            <p className="text-zinc-500 font-medium">Revisa la ortografía o intenta con otro nombre.</p>
          </div>
        )}

        {/* Access Control for Guests */}
        {currentTier === 'guest' && !query && (
          <AccessControl tier={currentTier} requiredTier="registered" className="mt-8 h-64" />
        )}

        {/* Premium Section Teaser */}
        <section className="mt-20">
          <div className="flex flex-col mb-10">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight uppercase italic">Análisis de Rendimiento</h2>
            <p className="text-zinc-500 font-medium">Estadísticas avanzadas para usuarios Premium.</p>
          </div>

          <AccessControl tier={currentTier} requiredTier="premium" className="rounded-[40px] overflow-hidden shadow-xl border border-zinc-100">
            <div className="bg-white p-10 min-h-[400px]">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-red-600">
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-zinc-900 tracking-tight uppercase">Goles por Década</h3>
                    <p className="text-zinc-500 font-medium text-sm">Distribución histórica de anotaciones.</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-8 items-end gap-3 h-48 mb-6 px-4">
                {[45, 78, 92, 65, 88, 120, 110, 85].map((h, i) => (
                  <div key={i} className="bg-red-600/10 hover:bg-red-600 transition-all rounded-t-xl group relative" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <span>1950</span>
                <span>1960</span>
                <span>1970</span>
                <span>1980</span>
                <span>1990</span>
                <span>2000</span>
                <span>2010</span>
                <span>2020</span>
              </div>
            </div>
          </AccessControl>
        </section>
      </section>
    </div>
  );
}
