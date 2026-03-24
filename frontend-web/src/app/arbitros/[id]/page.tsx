import { ChevronLeft, Scale, Trophy, Calendar, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";

interface Partido {
  fecha: string;
  go_ri: number;
  go_ad: number;
  resultado: string;
  rival?: {
    ri_desc: string;
  };
  torneo_rel?: {
    tor_desc: string;
  };
}

interface Arbitro {
  ar_id: number;
  ar_apno: string;
  partidos: Partido[];
}

export default async function ArbitroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Mock current user tier
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';

  let arbitro: Arbitro | null = null;
  try {
    const response = await customInstance<{ data: Arbitro }>({
      url: `/v1/arbitros/${id}`,
      method: 'GET',
    });
    arbitro = response.data;
  } catch (error) {
    console.error("Error fetching arbitro:", error);
  }

  if (!arbitro) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Árbitro no encontrado</h1>
        <Link href="/arbitros" className="text-red-600 font-bold hover:underline mt-4 inline-block uppercase text-xs tracking-widest">Volver a árbitros</Link>
      </div>
    );
  }

  const partidos = arbitro.partidos || [];
  const victorias = partidos.filter(p => p.resultado === 'G').length;
  const empates = partidos.filter(p => p.resultado === 'E').length;
  const derrotas = partidos.filter(p => p.resultado === 'P').length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Navigation */}
      <Link href="/arbitros" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-xs uppercase tracking-widest mb-8 transition-colors group">
        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver a árbitros
      </Link>

      {/* Hero Section */}
      <section className="bg-white rounded-[40px] border border-zinc-100 p-8 md:p-12 shadow-sm mb-12 relative overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Scale size={240} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            <span className="bg-zinc-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Juez de Encuentro</span>
            <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              ID: {arbitro.ar_id}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-tight mb-8">
            {arbitro.ar_apno}
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
            <div className="bg-zinc-50 p-4 rounded-3xl text-center">
              <span className="block text-2xl font-black text-zinc-900">{partidos.length}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dirigidos</span>
            </div>
            <div className="bg-zinc-50 p-4 rounded-3xl text-center">
              <span className="block text-2xl font-black text-green-600">{victorias}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ganados</span>
            </div>
            <div className="bg-zinc-50 p-4 rounded-3xl text-center">
              <span className="block text-2xl font-black text-zinc-900">{empates}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Empatados</span>
            </div>
            <div className="bg-zinc-50 p-4 rounded-3xl text-center">
              <span className="block text-2xl font-black text-red-600">{derrotas}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Perdidos</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Matches List */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center">
            <Calendar className="mr-3 text-red-600" size={20} />
            Partidos Dirigidos
          </h2>

          <AccessControl tier={currentTier} requiredTier="registered">
            {partidos.length > 0 ? (
              <div className="space-y-3">
                {partidos.map((p) => (
                  <Link 
                    key={p.fecha} 
                    href={`/partidos/${p.fecha}`}
                    className="bg-white p-6 rounded-[32px] border border-zinc-100 flex items-center justify-between shadow-sm group hover:border-red-200 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                        {new Date(p.fecha).toLocaleDateString('es-AR')}
                      </span>
                      <span className="font-black text-zinc-800 uppercase text-xs tracking-tight group-hover:text-red-600 transition-colors">
                        vs {p.rival?.ri_desc || 'Rival'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xl font-black ${p.resultado === 'G' ? 'text-green-600' : p.resultado === 'P' ? 'text-red-600' : 'text-zinc-400'}`}>
                        {p.go_ri} - {p.go_ad}
                      </span>
                      <ChevronRight className="text-zinc-200 group-hover:text-red-500 transition-colors" size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-[40px] p-12 text-center border-2 border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">No hay partidos registrados con este árbitro.</p>
              </div>
            )}
          </AccessControl>
        </div>

        {/* Right Column: Premium Section */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center italic">
            <Zap className="mr-3 text-yellow-500 fill-yellow-500" size={20} />
            Tendencia
          </h2>

          <AccessControl tier={currentTier} requiredTier="premium">
            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-sm">
               <h3 className="font-black text-sm uppercase tracking-widest mb-8 text-zinc-400 italic text-center">Balance Disciplinario</h3>
               
               <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-100 rounded-[32px] mb-8">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Analizando...</span>
               </div>

               <p className="text-[10px] font-medium text-zinc-500 leading-relaxed uppercase text-center">
                 Accede a datos sobre tarjetas y penales sancionados por este juez.
               </p>
            </div>
          </AccessControl>
        </div>
      </div>
    </div>
  );
}
