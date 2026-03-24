import { ChevronLeft, UserRound, Award, TrendingUp, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import { customInstance } from "@/api/custom-instance";

interface Tecnico {
  id_tecnicos: number;
  tec_ape_nom: string;
  desde: string;
  hasta: string;
  cargo: string;
}

export default async function TecnicoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Mock current user tier
  const currentTier: 'guest' | 'registered' | 'premium' = 'registered';

  let tecnico: Tecnico | null = null;
  try {
    const response = await customInstance<{ data: Tecnico }>({
      url: `/v1/tecnicos/${id}`,
      method: 'GET',
    });
    tecnico = response.data;
  } catch (error) {
    console.error("Error fetching tecnico:", error);
  }

  if (!tecnico) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Técnico no encontrado</h1>
        <Link href="/tecnicos" className="text-red-600 font-bold hover:underline mt-4 inline-block uppercase text-xs tracking-widest">Volver a la lista</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Navigation */}
      <Link href="/tecnicos" className="flex items-center text-zinc-400 hover:text-red-600 font-black text-xs uppercase tracking-widest mb-8 transition-colors group">
        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver al archivo
      </Link>

      {/* Hero Profile */}
      <section className="bg-white rounded-[40px] border border-zinc-100 p-8 md:p-12 shadow-sm mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Award size={240} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
          <div className="w-40 h-40 bg-slate-50 rounded-[48px] flex items-center justify-center text-slate-300 font-black text-6xl shadow-inner border-4 border-white rotate-3">
            {tecnico.tec_ape_nom.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{tecnico.cargo || 'Director Técnico'}</span>
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">River Plate</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-tight mb-6">
              {tecnico.tec_ape_nom}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <div className="bg-zinc-50 p-6 rounded-3xl flex items-center space-x-4">
                <Calendar className="text-red-600" size={24} />
                <div className="text-left">
                  <span className="block text-xs font-black text-zinc-400 uppercase tracking-widest">Inicio Ciclo</span>
                  <span className="text-lg font-black text-zinc-900 uppercase tracking-tight">{tecnico.desde || 'Sin Fecha'}</span>
                </div>
              </div>
              <div className="bg-zinc-50 p-6 rounded-3xl flex items-center space-x-4">
                <Clock className="text-red-600" size={24} />
                <div className="text-left">
                  <span className="block text-xs font-black text-zinc-400 uppercase tracking-widest">Fin Ciclo</span>
                  <span className="text-lg font-black text-zinc-900 uppercase tracking-tight">{tecnico.hasta || 'Presente'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Stats */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center">
            <Award className="mr-3 text-red-600" size={20} />
            Rendimiento del Ciclo
          </h2>

          <AccessControl tier={currentTier} requiredTier="registered">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               {[
                 { label: 'Victorias', val: '-', color: 'text-green-600' },
                 { label: 'Empates', val: '-', color: 'text-zinc-400' },
                 { label: 'Derrotas', val: '-', color: 'text-red-600' },
               ].map(s => (
                 <div key={s.label} className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm text-center">
                    <span className={`block text-4xl font-black mb-1 ${s.color}`}>{s.val}</span>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</span>
                 </div>
               ))}
            </div>
            
            <div className="bg-zinc-50 rounded-[40px] p-12 text-center border-2 border-dashed border-zinc-200">
              <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Estamos procesando el historial de partidos para este técnico...</p>
            </div>
          </AccessControl>
        </div>

        {/* Right Column: Premium Analytics */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight uppercase flex items-center italic">
            <TrendingUp className="mr-3 text-red-600" size={20} />
            Efectividad
          </h2>

          <AccessControl tier={currentTier} requiredTier="premium">
            <div className="bg-slate-900 rounded-[40px] p-8 text-white">
              <h3 className="font-black text-sm uppercase tracking-widest mb-10 text-red-500 italic">Comparativa Histórica</h3>
              
              <div className="flex flex-col items-center justify-center py-10 border-2 border-white/5 rounded-[32px] mb-8 bg-white/5">
                 <div className="text-6xl font-black text-red-500 mb-2 tracking-tighter">-%</div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center px-6">
                   Porcentaje de efectividad total sobre puntos en disputa.
                 </p>
              </div>

              <div className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">vs Promedio de Técnicos</p>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-red-600" style={{ width: '65%' }} />
                    </div>
                 </div>
              </div>
            </div>
          </AccessControl>
        </div>
      </div>
    </div>
  );
}
