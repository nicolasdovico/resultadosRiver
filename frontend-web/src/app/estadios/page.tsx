import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";

interface Estadio {
  es_id: number;
  es_desc: string;
}

export default async function EstadiosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';
  
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';

  const response = await customInstance<{ data: Estadio[] }>({
    url: '/v1/estadios',
    method: 'GET',
    params: { q: query }
  });
  
  const visibleEstadios: Estadio[] = response.data || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-zinc-100 text-zinc-500 rounded-2xl flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Estadios</h1>
          </div>
          <p className="text-zinc-500 font-medium max-w-xl">
            Los escenarios de la gloria. Donde River Plate desplegó su fútbol a lo largo de la historia.
          </p>
        </div>
        <div className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center">
          <MapPin className="mr-2" size={14} />
          {query ? `${visibleEstadios.length} encontrados` : `Archivo de Sedes`}
        </div>
      </div>

      <section className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic">Lista de Estadios</h2>
          {currentTier !== 'guest' && (
            <SearchBar placeholder="Buscar por nombre o ciudad..." className="w-full md:max-w-md" />
          )}
        </div>

        {visibleEstadios.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleEstadios.map((estadio) => (
              <Link 
                key={estadio.es_id}
                href={`/estadios/${estadio.es_id}`}
                className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center justify-between group hover:border-zinc-300 transition-all shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                    <MapPin size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-zinc-800 tracking-tight text-[10px] uppercase leading-tight line-clamp-2">{estadio.es_desc}</span>
                    <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-1">ID: {estadio.es_id}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
            <MapPin className="mx-auto mb-4 text-zinc-300" size={48} />
            <h3 className="text-xl font-black text-zinc-900 mb-2">No encontramos el estadio "{query}"</h3>
            <p className="text-zinc-500 font-medium">Prueba con otro nombre o ciudad.</p>
          </div>
        )}
      </section>
    </div>
  );
}
