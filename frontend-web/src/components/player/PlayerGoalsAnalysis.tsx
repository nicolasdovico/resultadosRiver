'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface Interval {
  label: string;
  count: number;
}

interface PeriodStat {
  period_name: string;
  intervals: Interval[];
}

interface PlayerGoalsAnalysisProps {
  data: PeriodStat[];
  total: number;
}

export default function PlayerGoalsAnalysis({ data, total }: PlayerGoalsAnalysisProps) {
  if (total === 0 || !data || data.length === 0) {
    return (
      <div className="bg-white p-10 min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mb-4">
            <BarChart3 size={32} />
          </div>
          <h3 className="font-black text-xl text-zinc-900 tracking-tight uppercase mb-2">Sin datos de periodos</h3>
          <p className="text-zinc-400 font-medium max-w-xs text-sm text-center">
            No hay información detallada sobre el momento de los goles para este jugador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-10 min-h-[400px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm">
            <BarChart3 size={28} />
          </div>
          <div>
            <h3 className="font-black text-xl text-zinc-900 tracking-tight uppercase">Goles por Tiempo</h3>
            <p className="text-zinc-500 font-medium text-sm">
              Distribución de conquistas en bloques de 10 minutos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{total} Goles Totales</span>
        </div>
      </div>
      
      <div className="space-y-16">
        {data.map((period, pIndex) => (
          <div key={pIndex} className="relative">
            <div className="flex items-center gap-4 mb-10">
              <h4 className="text-sm font-black text-zinc-900 uppercase tracking-[0.2em] bg-zinc-50 px-4 py-1.5 rounded-lg border border-zinc-100 shadow-sm">
                {period.period_name}
              </h4>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            <div className="space-y-10">
              {period.intervals.map((interval) => {
                const percentage = total > 0 ? Math.round((interval.count / total) * 100) : 0;
                return (
                  <div key={interval.label} className="grid grid-cols-[80px_1fr_80px] items-center group">
                    <span className="text-[10px] font-black text-zinc-400 uppercase group-hover:text-zinc-900 transition-colors">
                      {interval.label}
                    </span>
                    
                    <div className="flex flex-col gap-1.5 px-4 border-l border-zinc-50">
                      <div className="relative flex items-center">
                        <div className="flex-1 h-3 bg-zinc-50 rounded-full overflow-hidden relative border border-zinc-100/50">
                          <div 
                            className="h-full bg-red-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(220,38,38,0.1)]"
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                        <span className="ml-4 text-[10px] font-black text-red-600 w-16 tabular-nums">
                          {interval.count} <span className="text-[8px] text-red-300">({percentage}%)</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      {percentage >= 20 ? (
                        <div className="text-[8px] font-black text-green-600 uppercase bg-green-50 px-1.5 py-0.5 rounded leading-none">
                          Zona Letal
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
