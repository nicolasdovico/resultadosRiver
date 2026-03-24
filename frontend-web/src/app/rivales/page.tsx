import { ShieldAlert, Target, Zap, Users } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";

interface Rival {
  ri_id: number;
  ri_desc: string;
}

export default async function RivalesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';
  
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.toUpperCase() : '';

  const response = await customInstance<{ data: Rival[] }>({
    url: '/v1/rivales',
    method: 'GET',
    params: { q: query }
  });
  
  const visibleRivales: Rival[] = response.data || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-zinc-100 text-zinc-500 rounded-2xl flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Rivales</h1>
          </div>
          <p className="text-zinc-500 font-medium max-w-xl">
            El historial frente a cada adversario. Goles, rachas y encuentros inolvidables.
          </p>
        </div>
        <div className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center">
          <Users className="mr-2" size={14} />
          {query ? `${visibleRivales.length} encontrados` : `Archivo Histórico`}
        </div>
      </div>

      {/* Guest View: Big Matches History */}
      {!query && (
        <section className="mb-16">
          <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center tracking-tight uppercase">
            <Target className="mr-3 text-red-600" size={20} />
            Historial Clásico
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'BOCA JUNIORS', diff: '+5', trend: 'up' },
              { name: 'INDEPENDIENTE', diff: '+24', trend: 'up' },
              { name: 'RACING CLUB', diff: '+48', trend: 'up' },
              { name: 'SAN LORENZO', diff: '+18', trend: 'up' },
            ].map((r) => (
              <div key={r.name} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm group hover:border-red-200 transition-all">
                <h3 className="font-black text-zinc-400 text-[10px] uppercase tracking-widest mb-4">{r.name}</h3>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-black text-zinc-900">{r.diff}</span>
                  <Zap className="text-green-500 mb-1" size={20} />
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Partidos de Ventaja</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main List with Access Control */}
      <section className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Todos los Rivales</h2>
          {currentTier !== 'guest' && (
            <SearchBar placeholder="Buscar rival..." className="w-full md:max-w-md" />
          )}
        </div>
        
        {visibleRivales.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {visibleRivales.map((rival) => (
              <Link 
                key={rival.ri_id}
                href={`/rivales/${rival.ri_id}`}
                className="bg-white p-6 rounded-[32px] border border-zinc-100 flex flex-col items-center justify-center group hover:border-red-200 transition-all text-center aspect-square shadow-sm"
              >
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 font-black text-2xl mb-4 group-hover:bg-red-50 group-hover:text-red-600 transition-all uppercase">
                  {rival.ri_desc?.charAt(0)}
                </div>
                <span className="font-black text-zinc-700 tracking-tight text-[10px] uppercase leading-tight line-clamp-2 px-2 group-hover:text-red-600 transition-colors">
                  {rival.ri_desc}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
            <ShieldAlert className="mx-auto mb-4 text-zinc-300" size={48} />
            <h3 className="text-xl font-black text-zinc-900 mb-2">No encontramos a "{query}"</h3>
            <p className="text-zinc-500 font-medium">Revisa el nombre o intenta con otro rival.</p>
          </div>
        )}
      </section>
    </div>
  );
}
