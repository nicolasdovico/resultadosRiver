import { getPartidos } from "@/api/generated/endpoints/partidos/partidos";
import { getTorneos } from "@/api/generated/endpoints/torneos/torneos";
import { getRivales } from "@/api/generated/endpoints/rivales/rivales";
import { getTecnicos } from "@/api/generated/endpoints/tecnicos/tecnicos";
import DashboardFilters from "@/components/DashboardFilters";
import Link from "next/link";

interface Partido {
  fecha: string;
  rival: {
    riv_nombre: string;
  };
  torneo: {
    tor_nombre: string;
  };
  goles_river: number;
  goles_rival: number;
  resultado: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Prepare filters for the API
  const apiParams: Record<string, string | number> = {};
  if (params.torneo) apiParams.torneo = Number(params.torneo);
  if (params.adversario) apiParams.adversario = Number(params.adversario);
  if (typeof params.torneo_nivel === 'string') apiParams.torneo_nivel = params.torneo_nivel;

  // Fetch all data in parallel for SSR
  const [partidosRes, torneosRes, rivalesRes, tecnicosRes] = await Promise.all([
    getPartidos(apiParams),
    getTorneos(),
    getRivales(),
    getTecnicos()
  ]);

  // @ts-expect-error - Resource data structure is not fully typed in SDK
  const partidos: Partido[] = (partidosRes as { data?: Partido[] }).data || [];
  // @ts-expect-error - Resource data structure is not fully typed in SDK
  const torneos = (torneosRes as { data?: { id: number; tor_nombre: string }[] }).data || [];
  // @ts-expect-error - Resource data structure is not fully typed in SDK
  const rivales = (rivalesRes as { data?: { id: number; riv_nombre: string }[] }).data || [];
  // @ts-expect-error - Resource data structure is not fully typed in SDK
  const tecnicos = (tecnicosRes as { data?: { id: number; tec_nombre: string }[] }).data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Dashboard de Resultados</h1>
        <p className="text-slate-500 max-w-2xl">
          Explora el historial completo de River Plate. Filtra por torneo, rival o técnico para analizar el rendimiento histórico del Millonario.
        </p>
      </section>

      <DashboardFilters 
        torneos={torneos} 
        rivales={rivales} 
        tecnicos={tecnicos} 
      />

      <div className="grid gap-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-slate-800">Partidos Recientes</h2>
          <Link href="/partidos" className="text-red-600 font-semibold text-sm hover:underline">Ver todo el historial</Link>
        </div>

        {partidos.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {partidos.map((partido) => (
              <Link 
                key={partido.fecha} 
                href={`/partidos/${partido.fecha}`}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition-all flex items-center group"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">{partido.fecha}</span>
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold uppercase">{partido.torneo.tor_nombre}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">River Plate</span>
                      <span className="text-sm text-slate-500">{partido.rival.riv_nombre}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center">
                        <span className={`text-2xl font-black ${partido.resultado === 'G' ? 'text-green-600' : partido.resultado === 'P' ? 'text-red-600' : 'text-slate-600'}`}>
                          {partido.goles_river} - {partido.goles_rival}
                        </span>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${partido.resultado === 'G' ? 'bg-green-500' : partido.resultado === 'P' ? 'bg-red-500' : 'bg-slate-400'}`}>
                        {partido.resultado}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-slate-300 group-hover:text-red-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No hay resultados</h3>
            <p className="text-slate-500 text-sm">Prueba ajustando los filtros de búsqueda.</p>
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-3xl text-white shadow-lg shadow-red-200">
          <h3 className="text-lg font-bold mb-2">Suscripción Premium</h3>
          <p className="text-red-100 text-sm mb-4">Desbloquea gráficos interactivos y estadísticas avanzadas de rendimiento.</p>
          <button className="bg-white text-red-700 font-bold py-2 px-4 rounded-xl text-sm hover:bg-red-50 transition-colors">
            Saber más
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Próximas Funcionalidades</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 text-slate-500">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm">Gráficos de efectividad</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-500">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm">Mapas de calor</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-500">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm">Comparativa de técnicos</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-500">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm">Rendimiento por estadio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
