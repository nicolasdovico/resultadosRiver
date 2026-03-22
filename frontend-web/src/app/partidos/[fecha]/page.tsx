import { getPartidoByFecha } from "@/api/generated/endpoints/partidos/partidos";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Gol {
  minuto: number;
  jugador: {
    pla_nombre: string;
  };
  tipo: string;
}

interface PartidoFull {
  fecha: string;
  rival: {
    riv_nombre: string;
  };
  torneo: {
    tor_nombre: string;
  };
  estadio: {
    est_nombre: string;
  };
  arbitro: {
    arb_nombre: string;
  };
  tecnico?: {
    tec_nombre: string;
  };
  goles_river: number;
  goles_rival: number;
  resultado: string;
  goles?: Gol[];
}

export async function generateMetadata({ params }: { params: Promise<{ fecha: string }> }) {
  const { fecha } = await params;
  return {
    title: `River Plate vs Rival - ${fecha}`,
  };
}

export default async function PartidoDetailPage({ params }: { params: Promise<{ fecha: string }> }) {
  const { fecha } = await params;
  let partido: PartidoFull | null = null;

  try {
    const response = await getPartidoByFecha(fecha);
    // @ts-expect-error - Resource data structure is not fully typed in SDK
    partido = response.data;
  } catch (error) {
    console.error("Error fetching partido:", error);
    return notFound();
  }

  if (!partido) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/partidos" className="text-red-600 hover:text-red-700 font-medium flex items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Volver a partidos
      </Link>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-red-700 p-8 text-white text-center">
          <p className="text-red-100 uppercase tracking-widest text-sm font-bold mb-2">{partido.torneo.tor_nombre}</p>
          <div className="flex items-center justify-center space-x-12">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <span className="text-4xl">⚪🔴</span>
              </div>
              <h2 className="text-2xl font-black">River Plate</h2>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-6xl font-black tracking-tighter tabular-nums">
                {partido.goles_river} - {partido.goles_rival}
              </span>
              <div className={`mt-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${partido.resultado === 'G' ? 'bg-green-500' : partido.resultado === 'P' ? 'bg-red-500' : 'bg-slate-500'}`}>
                {partido.resultado === 'G' ? 'Ganado' : partido.resultado === 'P' ? 'Perdido' : 'Empate'}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <span className="text-4xl">⚽</span>
              </div>
              <h2 className="text-2xl font-black">{partido.rival.riv_nombre}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-8">
            <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-4">Información del Encuentro</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-slate-50 p-2 rounded-lg mr-3 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Fecha</p>
                  <p className="font-bold text-slate-700">{partido.fecha}</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-slate-50 p-2 rounded-lg mr-3 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Estadio</p>
                  <p className="font-bold text-slate-700">{partido.estadio.est_nombre}</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-slate-50 p-2 rounded-lg mr-3 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Árbitro</p>
                  <p className="font-bold text-slate-700">{partido.arbitro.arb_nombre}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-8 md:col-span-2">
            <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-6">Incidencias (Goles de River)</h3>
            <div className="space-y-3">
              {partido.goles && partido.goles.length > 0 ? (
                partido.goles.map((gol, idx) => (
                  <div key={idx} className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="bg-green-100 text-green-700 w-10 h-10 flex items-center justify-center rounded-full font-black mr-4">
                      {gol.minuto}&apos;
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{gol.jugador.pla_nombre}</p>
                      <p className="text-xs text-slate-500 uppercase font-medium">{gol.tipo || 'Jugada'}</p>
                    </div>
                    <div className="text-2xl">⚽</div>
                  </div>
                ))
              ) : partido.goles_river > 0 ? (
                <p className="text-slate-400 italic">No hay detalles de los goleadores registrados.</p>
              ) : (
                <p className="text-slate-400 italic">River Plate no anotó goles en este partido.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
