'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Clock, ShieldAlert } from 'lucide-react';

interface IntervalData {
  count: number;
  percentage: number;
}

interface Interval {
  label: string;
  river: IntervalData;
  opponent: IntervalData;
}

interface PeriodStat {
  period_id: number;
  period_name: string;
  river_total: number;
  opponent_total: number;
  intervals: Interval[];
}

interface GoalsAnalysisData {
  periods: PeriodStat[];
  total_river: number;
  total_opponent: number;
}

interface GoalsAnalysisProps {
  filters: {
    q?: string;
    torneo?: string;
    adversario?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  };
}

export default function GoalsAnalysis({ filters }: GoalsAnalysisProps) {
  const [data, setData] = useState<GoalsAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.q) queryParams.append('q', filters.q);
        if (filters.torneo) queryParams.append('torneo', filters.torneo);
        if (filters.adversario) queryParams.append('adversario', filters.adversario);
        if (filters.fecha_desde) queryParams.append('fecha_desde', filters.fecha_desde);
        if (filters.fecha_hasta) queryParams.append('fecha_hasta', filters.fecha_hasta);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stats/goals-by-period?${queryParams.toString()}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching goals analysis:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [filters]);

  if (loading) {
    return (
      <div className="bg-white p-10 min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Comparando Goles...</p>
        </div>
      </div>
    );
  }

  const hasData = data && (data.total_river > 0 || data.total_opponent > 0);

  if (!data || !hasData) {
    return (
      <div className="bg-white p-10 min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mb-4">
          <BarChart3 size={32} />
        </div>
        <h3 className="font-black text-xl text-zinc-900 tracking-tight uppercase mb-2">Sin datos de goles</h3>
        <p className="text-zinc-400 font-medium max-w-xs text-sm">
          No hay goles registrados para los criterios de búsqueda aplicados.
        </p>
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
              Análisis comparativo River vs Rivales en bloques de 10 min.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{data.total_river} Favor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-800 rounded-full" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{data.total_opponent} Contra</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-20">
        {data.periods.map((period) => (
          <div key={period.period_id} className="relative">
            <div className="flex items-center gap-4 mb-10">
              <h4 className="text-sm font-black text-zinc-900 uppercase tracking-[0.2em] bg-zinc-50 px-4 py-1.5 rounded-lg border border-zinc-100 shadow-sm">
                {period.period_name}
              </h4>
              <div className="h-px flex-1 bg-zinc-100" />
              <div className="flex gap-4">
                <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">{period.river_total} GF</span>
                <span className="text-[9px] font-black text-zinc-800 uppercase tracking-tighter">{period.opponent_total} GC</span>
              </div>
            </div>

            <div className="space-y-10">
              {period.intervals.map((interval) => (
                <div key={interval.label} className="grid grid-cols-[80px_1fr_80px] items-center group">
                  <span className="text-[10px] font-black text-zinc-400 uppercase group-hover:text-zinc-900 transition-colors">
                    {interval.label}
                  </span>
                  
                  <div className="flex flex-col gap-1.5 px-4 border-l border-zinc-50">
                    {/* River Bar */}
                    <div className="relative flex items-center">
                      <div className="flex-1 h-2.5 bg-zinc-50 rounded-full overflow-hidden relative border border-zinc-100/50">
                        <div 
                          className="h-full bg-red-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(220,38,38,0.1)]"
                          style={{ width: `${(interval.river.count / Math.max(1, period.river_total)) * 100}%` }} 
                        />
                      </div>
                      <span className="ml-3 text-[10px] font-black text-red-600 w-12 tabular-nums">
                        {interval.river.count} <span className="text-[8px] text-red-300">({interval.river.percentage}%)</span>
                      </span>
                    </div>

                    {/* Opponent Bar */}
                    <div className="relative flex items-center">
                      <div className="flex-1 h-2 bg-zinc-50 rounded-full overflow-hidden relative border border-zinc-100/50">
                        <div 
                          className="h-full bg-zinc-800 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${(interval.opponent.count / Math.max(1, period.opponent_total)) * 100}%` }} 
                        />
                      </div>
                      <span className="ml-3 text-[10px] font-black text-zinc-800 w-12 tabular-nums">
                        {interval.opponent.count} <span className="text-[8px] text-zinc-400">({interval.opponent.percentage}%)</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    {interval.river.count > interval.opponent.count ? (
                      <div className="text-[8px] font-black text-green-600 uppercase bg-green-50 px-1.5 py-0.5 rounded leading-none">
                        + Letal
                      </div>
                    ) : interval.opponent.count > interval.river.count && interval.opponent.count > 0 ? (
                      <div className="text-[8px] font-black text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded leading-none">
                        Vulnerable
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 pt-8 border-t border-zinc-100 flex flex-wrap gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full" />
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Goles de River</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-zinc-800 rounded-full" />
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Goles en Contra</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-amber-500" />
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Alertas de Defensa</span>
        </div>
      </div>
    </div>
  );
}
