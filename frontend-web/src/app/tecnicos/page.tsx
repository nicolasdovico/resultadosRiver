import Link from "next/link";
import { UserRound, ChevronRight, Award, Percent, Users } from "lucide-react";
import AccessControl from "@/components/AccessControl";
import SearchBar from "@/components/SearchBar";
import { customInstance } from "@/api/custom-instance";

interface Tecnico {
  id_tecnicos: number;
  tec_ape_nom: string;
  desde: string;
  hasta: string;
  cargo: string;
}

export default async function TecnicosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';
  
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';

  const response = await customInstance<{ data: Tecnico[] }>({
    url: '/v1/tecnicos',
    method: 'GET',
    params: { q: query }
  });
  
  const visibleTecnicos: Tecnico[] = response.data || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center">
              <UserRound size={24} />
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight uppercase">Técnicos</h1>
          </div>
          <p className="text-zinc-500 font-medium max-w-xl">
            Desde los fundadores hasta los ciclos más gloriosos. Explora la efectividad de cada DT.
          </p>
        </div>
        <div className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center">
          <Users className="mr-2" size={14} />
          {query ? `${visibleTecnicos.length} encontrados` : `Archivo Histórico`}
        </div>
      </div>

      {/* Guest View: Recent/Iconic Cycles */}
      {!query && (
        <section className="mb-16">
          <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center tracking-tight uppercase">
            <Award className="mr-3 text-red-600" size={20} />
            Ciclos Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'GALLARDO, MARCELO', period: '2014 - 2022', titles: 14, winRate: '54%' },
              { name: 'RAMÓN DÍAZ', period: '1995 - 2014', titles: 9, winRate: '51%' },
              { name: 'LABRUNA, ÁNGEL', period: '1975 - 1981', titles: 6, winRate: '48%' },
            ].map((cycle) => (
              <div key={cycle.name} className="bg-zinc-900 p-8 rounded-[32px] text-white relative overflow-hidden group">
                <Award className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-red-600/20 transition-colors" size={160} />
                <div className="relative z-10">
                  <h3 className="font-black text-lg mb-1 leading-tight uppercase">{cycle.name}</h3>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6">{cycle.period}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-black text-red-500">{cycle.titles}</span>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Títulos</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-zinc-300">{cycle.winRate}</span>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Efectividad</p>
                    </div>
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
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Lista Completa de DTs</h2>
          {currentTier !== 'guest' && (
            <SearchBar placeholder="Buscar por nombre..." className="w-full md:max-w-md" />
          )}
        </div>
        
        {visibleTecnicos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTecnicos.map((tecnico) => (
              <Link 
                key={tecnico.id_tecnicos}
                href={`/tecnicos/${tecnico.id_tecnicos}`}
                className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center justify-between group hover:border-slate-200 transition-all shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 font-black text-xl uppercase group-hover:bg-slate-100 group-hover:text-slate-600 transition-all">
                    {tecnico.tec_ape_nom.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-zinc-800 tracking-tight text-sm uppercase">
                      {tecnico.tec_ape_nom}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{tecnico.desde || 'N/A'}</span>
                  </div>
                </div>
                <ChevronRight className="text-zinc-200 group-hover:text-red-500 transition-colors" size={20} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
            <UserRound className="mx-auto mb-4 text-zinc-300" size={48} />
            <h3 className="text-xl font-black text-zinc-900 mb-2">No encontramos a "{query}"</h3>
            <p className="text-zinc-500 font-medium">Revisa el nombre o intenta con otro técnico.</p>
          </div>
        )}

        {/* Premium Section: Effectiveness Analysis */}
        <section className="mt-20">
          <div className="flex flex-col mb-10">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight uppercase italic">Análisis de Eficacia</h2>
            <p className="text-zinc-500 font-medium">Comparativa de puntos obtenidos por etapa histórica.</p>
          </div>

          <AccessControl tier={currentTier} requiredTier="premium" className="rounded-[40px] overflow-hidden shadow-xl border border-zinc-100">
            <div className="bg-white p-10 min-h-[400px]">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center text-slate-600">
                    <Percent size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-zinc-900 tracking-tight uppercase">Ranking de Puntos</h3>
                    <p className="text-zinc-500 font-medium text-sm">Top 5 DTs por porcentaje de victorias.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { name: 'EMERICO HIRSCHL', rate: 68, color: 'bg-red-600' },
                  { name: 'RENATO CESARINI', rate: 64, color: 'bg-red-500' },
                  { name: 'MINNELLA, JOSÉ MARÍA', rate: 61, color: 'bg-red-400' },
                  { name: 'DAPUENTE, FRANCISCO', rate: 59, color: 'bg-zinc-400' },
                  { name: 'GALLARDO, MARCELO', rate: 54, color: 'bg-zinc-300' },
                ].map((dt) => (
                  <div key={dt.name} className="group">
                    <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 group-hover:text-zinc-900 transition-colors">
                      <span className="uppercase">{dt.name}</span>
                      <span>{dt.rate}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-50 rounded-full overflow-hidden">
                      <div className={`h-full ${dt.color} transition-all duration-1000`} style={{ width: `${dt.rate}%` }} />
                    </div>
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
