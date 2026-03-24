import Link from "next/link";
import { Star, ChevronRight, Trophy, TrendingUp } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";

interface Torneo {
  tor_id: number;
  tor_desc: string;
  tor_nivel: string;
}

export default async function TorneosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';
  
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';

  const response = await customInstance<{ data: Torneo[] }>({
    url: '/v1/torneos',
    method: 'GET',
    params: { q: query }
  });
  
  const visibleTorneos: Torneo[] = response.data || [];

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
          {query ? `${visibleTorneos.length} encontrados` : `Competiciones`}
        </div>
      </div>

      {/* Guest View: Major Trophies Teaser */}
      {!query && (
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
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Lista de Competiciones</h2>
          {currentTier !== 'guest' && (
            <SearchBar placeholder="Buscar torneo por nombre..." className="w-full md:max-w-md" />
          )}
        </div>
        
        {visibleTorneos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTorneos.map((torneo) => (
              <Link 
                key={torneo.tor_id} 
                href={`/torneos/${torneo.tor_id}`}
                className="bg-white p-8 rounded-[32px] border border-zinc-100 hover:border-red-200 transition-all group shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {torneo.tor_nivel}
                  </div>
                  <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-red-50 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-black text-zinc-900 mb-2 group-hover:text-red-600 transition-colors tracking-tight uppercase italic">{torneo.tor_desc}</h3>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-auto">ID: {torneo.tor_id}</p>
              </Link>
            ))}
          </div>
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
