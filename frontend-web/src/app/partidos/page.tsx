import { getPartidos } from "@/api/generated/endpoints/partidos/partidos";
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

export const metadata = {
  title: "Partidos - Resultados River Plate",
  description: "Listado completo de partidos históricos de River Plate.",
};

export default async function PartidosPage() {
  // SSR call
  let partidos: Partido[] = [];
  try {
    const response = await getPartidos();
    // Assuming the response data structure from Laravel Paginated Resource
    // @ts-expect-error - Resource data structure is not fully typed in SDK
    partidos = response.data || [];
  } catch (error) {
    console.error("Error fetching partidos:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Historial de Partidos</h1>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium">
          {partidos.length} Partidos encontrados
        </div>
      </div>

      <div className="grid gap-4">
        {partidos.length > 0 ? (
          partidos.map((partido) => (
            <Link 
              key={partido.fecha} 
              href={`/partidos/${partido.fecha}`}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-red-300 transition-all flex items-center justify-between group"
            >
              <div className="flex flex-col">
                <span className="text-sm text-slate-500 font-medium">{partido.fecha}</span>
                <span className="text-xs text-red-600 font-bold uppercase tracking-wider">{partido.torneo.tor_nombre}</span>
              </div>
              
              <div className="flex items-center space-x-8 flex-1 justify-center">
                <div className="text-right w-32 font-bold text-lg">River Plate</div>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-black px-3 py-1 rounded ${partido.resultado === 'G' ? 'bg-green-100 text-green-700' : partido.resultado === 'P' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                    {partido.goles_river} - {partido.goles_rival}
                  </span>
                </div>
                <div className="w-32 font-bold text-lg text-left">{partido.rival.riv_nombre}</div>
              </div>

              <div className="flex items-center text-slate-400 group-hover:text-red-500">
                <span className="text-sm font-medium mr-2">Ver detalle</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">No se encontraron partidos disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
