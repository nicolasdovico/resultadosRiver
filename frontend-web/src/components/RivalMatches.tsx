'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { formatLocalDate } from '@/utils/date';
import RiverOfficialShield from '@/components/RiverOfficialShield';

interface Partido {
  fecha: string;
  fecha_nro?: number;
  goles_river: number;
  goles_rival: number;
  resultado: string;
  torneo?: {
    tor_desc: string;
  };
  fase?: {
    fa_desc: string;
  };
  condicion?: {
    co_desc: string;
  };
}

interface RivalMatchesProps {
  partidos: Partido[];
  itemsPerPage?: number;
}

export default function RivalMatches({ partidos, itemsPerPage = 15 }: RivalMatchesProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort matches by date descending (standard for rivals history)
  const sortedMatches = [...partidos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const totalPages = Math.ceil(sortedMatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMatches = sortedMatches.slice(startIndex, startIndex + itemsPerPage);

  if (sortedMatches.length === 0) {
    return (
      <div className="bg-white rounded-[48px] p-24 text-center border-2 border-dashed border-zinc-100">
        <p className="text-zinc-400 font-black uppercase text-xs tracking-[0.2em]">
          Sin registros históricos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        {currentMatches.map((p) => (
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
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <RiverOfficialShield />
                    <span className="font-black text-lg text-zinc-800 tracking-tight italic">River Plate</span>
                  </div>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded-xl font-black text-sm transition-all ${
              currentPage === 1
                ? 'bg-zinc-50 border-zinc-100 text-zinc-400 cursor-not-allowed opacity-50'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <ChevronLeft size={16} className="mr-1" />
              Anterior
            </div>
          </button>

          <div className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-black text-sm italic shadow-lg">
            {currentPage} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded-xl font-black text-sm transition-all ${
              currentPage === totalPages
                ? 'bg-zinc-50 border-zinc-100 text-zinc-400 cursor-not-allowed opacity-50'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              Siguiente
              <ChevronRight size={16} className="ml-1" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
