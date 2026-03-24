import Link from "next/link";
import { Scale, Users } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";

interface Arbitro {
  ar_id: number;
  ar_apno: string;
}

export default async function ArbitrosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';
  
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.toUpperCase() : '';

  const response = await customInstance<{ data: Arbitro[] }>({
    url: '/v1/arbitros',
    method: 'GET',
    params: { q: query }
  });
  
  const visibleArbitros: Arbitro[] = response.data || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-zinc-100 text-zinc-500 rounded-2xl flex items-center justify-center">
              <Scale size={24} />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Árbitros</h1>
          </div>
          <p className="text-zinc-500 font-medium max-w-xl">
            Estadísticas y récords de River Plate con los diferentes jueces que dirigieron sus encuentros.
          </p>
        </div>
        <div className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center">
          <Users className="mr-2" size={14} />
          {query ? `${visibleArbitros.length} encontrados` : `Archivo Histórico`}
        </div>
      </div>

      <section className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Lista de Árbitros</h2>
          {currentTier !== 'guest' && (
            <SearchBar placeholder="Buscar por nombre..." className="w-full md:max-w-md" />
          )}
        </div>

        {visibleArbitros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleArbitros.map((arbitro) => (
              <Link 
                key={arbitro.ar_id}
                href={`/arbitros/${arbitro.ar_id}`}
                className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center space-x-4 group hover:border-zinc-300 transition-all shadow-sm"
              >
                <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 font-black text-xs group-hover:bg-zinc-900 group-hover:text-white transition-all uppercase">
                  {arbitro.ar_apno.charAt(0)}
                </div>
                <span className="font-black text-zinc-800 text-[10px] uppercase tracking-tight leading-tight line-clamp-1 group-hover:text-red-600 transition-colors">{arbitro.ar_apno}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
            <Scale className="mx-auto mb-4 text-zinc-300" size={48} />
            <h3 className="text-xl font-black text-zinc-900 mb-2">No encontramos a "{query}"</h3>
            <p className="text-zinc-500 font-medium">Revisa el nombre o intenta con otro árbitro.</p>
          </div>
        )}
      </section>
    </div>
  );
}
