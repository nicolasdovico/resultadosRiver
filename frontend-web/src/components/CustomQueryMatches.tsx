'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { formatLocalDate } from '@/utils/date';
import ClubShield from '@/components/ClubShield';
import RiverOfficialShield from '@/components/RiverOfficialShield';

interface Partido {
  fecha: string;
  fecha_nro?: number;
  goles_river: number;
  goles_rival: number;
  resultado: string;
  rival?: {
    ri_desc: string;
    escudo_url?: string;
  };
  torneo?: {
    tor_desc: string;
  };
  fase?: {
    fa_desc: string;
  };
  condicion?: {
    co_desc: string;
  };
  estadio?: {
    es_desc: string;
  };
  arbitro?: {
    ar_desc?: string;
    ar_apno?: string;
  };
}

interface CustomQueryMatchesProps {
  partidos: Partido[];
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  isPremium?: boolean;
  totalMatchesCount?: number;
}

export default function CustomQueryMatches({
  partidos,
  currentPage = 1,
  totalPages = 1,
  isPremium = true,
  totalMatchesCount,
}: CustomQueryMatchesProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const displayedPartidos = !isPremium ? partidos.slice(0, 3) : partidos;
  const totalCount = totalMatchesCount ?? partidos.length;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (displayedPartidos.length === 0) {
    return (
      <div className="bg-white rounded-[48px] p-24 text-center border-2 border-dashed border-zinc-100">
        <p className="text-zinc-400 font-black uppercase text-xs tracking-[0.2em]">
          No se encontraron partidos para la combinación de filtros seleccionada
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        {displayedPartidos.map((p) => (
          <Link
            key={p.fecha}
            href={`/partidos/${p.fecha}`}
            className="bg-white p-6 rounded-[32px] border border-zinc-100 hover:border-red-200 transition-all flex items-center group shadow-sm"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  {formatLocalDate(p.fecha)}
                </span>
                <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight line-clamp-1">
                  {p.torneo?.tor_desc || 'Torneo Oficial'}
                </span>
                {p.fase && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                    {p.fase.fa_desc}
                  </span>
                )}
                {p.fecha_nro && (
                  <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                    Fecha {p.fecha_nro}
                  </span>
                )}
                {p.condicion && (
                  <span className="text-[10px] bg-amber-50 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                    {p.condicion.co_desc}
                  </span>
                )}
                {p.estadio && (
                  <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                    📍 {p.estadio.es_desc}
                  </span>
                )}
                {p.arbitro && (
                  <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                    ⚖️ {p.arbitro.ar_apno || p.arbitro.ar_desc}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <RiverOfficialShield />
                    <span className="font-black text-lg text-zinc-800 tracking-tight italic">River Plate</span>
                  </div>
                  {p.rival && (
                    <div className="flex items-center space-x-3">
                      <ClubShield src={p.rival?.escudo_url} alt={p.rival?.ri_desc} className="w-5 h-5" />
                      <span className="text-sm text-zinc-500 font-bold uppercase tracking-tight">{p.rival?.ri_desc}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end mr-2">
                    <span
                      className={`text-3xl font-black tabular-nums ${
                        p.resultado === 'G'
                          ? 'text-emerald-600'
                          : p.resultado === 'P'
                          ? 'text-red-600'
                          : 'text-zinc-400'
                      }`}
                    >
                      {p.goles_river} - {p.goles_rival}
                    </span>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm ${
                      p.resultado === 'G'
                        ? 'bg-green-500 shadow-green-100'
                        : p.resultado === 'P'
                        ? 'bg-red-500 shadow-red-100'
                        : 'bg-zinc-400 shadow-zinc-100'
                    }`}
                  >
                    {p.resultado}
                  </div>
                  <ChevronRight
                    className="text-zinc-300 group-hover:text-red-400 transition-colors ml-2"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Non-Premium History Limit Banner */}
      {!isPremium && totalCount > 3 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-md mx-auto">
            <span className="bg-yellow-400 text-yellow-950 text-[9px] font-black uppercase px-3 py-1 rounded-full inline-block mb-3">
              👑 Historial Limitado a 3 Partidos
            </span>
            <h4 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">
              Desbloquea los {totalCount} partidos de esta consulta
            </h4>
            <p className="text-zinc-400 text-xs font-medium mb-6">
              Los usuarios Premium tienen acceso al historial cronológico completo sin restricciones de paginación.
            </p>
            <Link
              href="/premium"
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase px-8 py-3.5 rounded-2xl tracking-widest transition-all shadow-lg shadow-red-600/30"
            >
              Hacerme Premium
            </Link>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && isPremium && (
        <div className="flex justify-center items-center space-x-2">
          {currentPage > 1 ? (
            <Link
              href={createPageURL(currentPage - 1)}
              scroll={false}
              className="px-4 py-2 border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white rounded-xl font-black text-sm transition-all"
            >
              <div className="flex items-center">
                <ChevronLeft size={16} className="mr-1" />
                Anterior
              </div>
            </Link>
          ) : (
            <div className="px-4 py-2 border rounded-xl font-black text-sm bg-zinc-50 border-zinc-100 text-zinc-400 cursor-not-allowed opacity-50 flex items-center">
              <ChevronLeft size={16} className="mr-1" />
              Anterior
            </div>
          )}

          <div className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-black text-sm italic shadow-lg">
            {currentPage} / {totalPages}
          </div>

          {currentPage < totalPages ? (
            <Link
              href={createPageURL(currentPage + 1)}
              scroll={false}
              className="px-4 py-2 border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white rounded-xl font-black text-sm transition-all"
            >
              <div className="flex items-center">
                Siguiente
                <ChevronRight size={16} className="ml-1" />
              </div>
            </Link>
          ) : (
            <div className="px-4 py-2 border rounded-xl font-black text-sm bg-zinc-50 border-zinc-100 text-zinc-400 cursor-not-allowed opacity-50 flex items-center">
              Siguiente
              <ChevronRight size={16} className="ml-1" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
