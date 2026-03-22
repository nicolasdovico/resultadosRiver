import { getTorneos } from "@/api/generated/endpoints/torneos/torneos";
import Link from "next/link";

interface Torneo {
  id: number;
  tor_nombre: string;
  tor_nivel: string;
  tor_periodo: string;
}

export const metadata = {
  title: "Torneos - Resultados River Plate",
  description: "Listado de torneos disputados por River Plate.",
};

export default async function TorneosPage() {
  let torneos: Torneo[] = [];
  try {
    const response = await getTorneos();
    // @ts-expect-error - Resource data structure is not fully typed in SDK
    torneos = response.data || [];
  } catch (error) {
    console.error("Error fetching torneos:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Torneos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {torneos.length > 0 ? (
          torneos.map((torneo) => (
            <Link 
              key={torneo.id} 
              href={`/torneos/${torneo.id}`}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-red-300 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Nivel {torneo.tor_nivel}
                </div>
                <span className="text-slate-400 group-hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{torneo.tor_nombre}</h3>
              <p className="text-slate-500 text-sm">Periodo: {torneo.tor_periodo}</p>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">No se encontraron torneos disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
