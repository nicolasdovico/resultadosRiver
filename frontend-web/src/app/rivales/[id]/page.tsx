import { ChevronLeft, ShieldAlert, Target, TrendingUp, Calendar, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";

interface Partido {
  fecha: string;
  go_ri: number;
  go_ad: number;
  resultado: string;
  torneo_rel?: {
    tor_desc: string;
  };
}

interface Rival {
  ri_id: number;
  ri_desc: string;
  partidos: Partido[];
}

export default async function RivalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Mock current user tier
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';

  let rival: Rival | null = null;
  try {
    const response = await customInstance<{ data: Rival }>({
      url: `/v1/rivales/${id}`,
      method: 'GET',
    });
    rival = response.data;
  } catch (error) {
    console.error("Error fetching rival:", error);
  }

  if (!rival) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Rival no encontrado</h1>
        <Link href="/rivales" className="text-red-600 font-bold hover:underline mt-4 inline-block uppercase text-xs tracking-widest">Volver a rivales</Link>
      </div>
    );
  }

  const partidos = rival.partidos || [];
  const victorias = partidos.filter(p => p.resultado === 'G').length;
  const empates = partidos.filter(p => p.resultado === 'E').length;
  const derrotas = partidos.filter(p => p.resultado === 'P').length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Navigation */}
      <Link href="/rivales" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-xs uppercase tracking-widest mb-8 transition-colors group">
        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver a rivales
      </Link>

      {/* Hero Head-to-Head */}
      <section className="bg-white rounded-[40px] border border-zinc-100 p-8 md:p-12 shadow-sm mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <ShieldAlert size={240} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
             <div className="flex flex-col items-center md:items-start flex-1">
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 mb-4">Club Atlético</span>
                <h1 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-tight">
                  River Plate
                </h1>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl">VS</div>
             </div>

             <div className="flex flex-col items-center md:items-end flex-1 text-center md:text-right">
                <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Adversario</span>
                <h1 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-tight">
                  {rival.ri_desc}
                </h1>
             </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-50 p-6 rounded-3xl text-center">
              <span className="block text-3xl font-black text-zinc-900">{partidos.length}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Enfrentamientos</span>
            </div>
            <div className="bg-zinc-50 p-6 rounded-3xl text-center border-b-4 border-green-500">
              <span className="block text-3xl font-black text-green-600">{victorias}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Victorias River</span>
            </div>
            <div className="bg-zinc-50 p-6 rounded-3xl text-center border-b-4 border-zinc-300">
              <span className="block text-3xl font-black text-zinc-900">{empates}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Empates</span>
            </div>
            <div className="bg-zinc-50 p-6 rounded-3xl text-center border-b-4 border-red-500">
              <span className="block text-3xl font-black text-red-600">{derrotas}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Victorias {rival.ri_desc}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Match History */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center">
            <Calendar className="mr-3 text-red-600" size={20} />
            Historial de Partidos
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
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                        {new Date(p.fecha).toLocaleDateString('es-AR')}
                      </span>
                      <span className="font-black text-zinc-800 uppercase text-xs tracking-tight line-clamp-1">
                        {p.torneo_rel?.tor_desc || 'Torneo Oficial'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className={`text-2xl font-black ${p.resultado === 'G' ? 'text-green-600' : p.resultado === 'P' ? 'text-red-600' : 'text-zinc-400'}`}>
                        {p.go_ri} - {p.go_ad}
                      </span>
                      <ChevronRight className="text-zinc-200 group-hover:text-red-500 transition-colors" size={20} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-[40px] p-12 text-center border-2 border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">No hay registros de partidos contra este rival.</p>
              </div>
            )}
          </AccessControl>
        </div>

        {/* Right Column: Premium Insights */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center italic">
            <TrendingUp className="mr-3 text-red-600" size={20} />
            Tendencias
          </h2>

          <AccessControl tier={currentTier} requiredTier="premium">
            <div className="bg-zinc-100 rounded-[40px] p-8">
               <h3 className="font-black text-sm uppercase tracking-widest mb-8 text-zinc-400">Balance de Goles</h3>
               
               <div className="space-y-8">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                      <span className="text-red-600">A Favor (River)</span>
                      <span>{partidos.reduce((acc, p) => acc + p.go_ri, 0)}</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
                       <div className="h-full bg-red-600" style={{ width: '70%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                      <span className="text-zinc-500">En Contra</span>
                      <span>{partidos.reduce((acc, p) => acc + p.go_ad, 0)}</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
                       <div className="h-full bg-zinc-400" style={{ width: '30%' }} />
                    </div>
                  </div>
               </div>

               <div className="mt-12 p-6 bg-white rounded-3xl shadow-sm border border-zinc-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                     <Zap className="text-yellow-500 fill-yellow-500" size={20} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Dato Curioso</span>
                  </div>
                  <p className="text-[10px] font-medium text-zinc-500 leading-relaxed uppercase">
                    River Plate ha mantenido la valla invicta en el <span className="text-zinc-900 font-black">XX%</span> de los últimos 10 encuentros contra este rival.
                  </p>
               </div>
            </div>
          </AccessControl>
        </div>
      </div>
    </div>
  );
}
