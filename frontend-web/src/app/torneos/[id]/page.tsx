import { getTorneoById } from "@/api/generated/endpoints/torneos/torneos";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TorneoFull {
  id: number;
  tor_nombre: string;
  tor_nivel: string;
  tor_periodo: string;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;
  return {
    title: `Torneo - ${id}`,
  };
}

export default async function TorneoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let torneo: TorneoFull | null = null;

  try {
    const response = await getTorneoById(Number(id));
    // @ts-expect-error - Resource data structure
    torneo = response.data;
  } catch (error) {
    console.error("Error fetching torneo:", error);
    return notFound();
  }

  if (!torneo) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/torneos" className="text-red-600 hover:text-red-700 font-medium flex items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Volver a torneos
      </Link>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-4">
              Nivel {torneo.tor_nivel}
            </div>
            <h1 className="text-4xl font-black text-slate-900">{torneo.tor_nombre}</h1>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">Periodo</p>
            <p className="text-2xl font-bold text-slate-700">{torneo.tor_periodo}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Resumen del Torneo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Partidos Jugados</p>
              <p className="text-3xl font-black text-slate-800">--</p>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
              <p className="text-xs text-green-600/60 font-bold uppercase tracking-widest mb-1">Efectividad</p>
              <p className="text-3xl font-black text-green-700">--%</p>
            </div>
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <p className="text-xs text-red-600/60 font-bold uppercase tracking-widest mb-1">Goles a Favor</p>
              <p className="text-3xl font-black text-red-700">--</p>
            </div>
          </div>
          <div className="mt-8 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">Las estadísticas detalladas por torneo estarán disponibles próximamente para usuarios <strong>Premium</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
