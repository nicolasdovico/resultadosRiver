'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target, Info, ShieldAlert } from 'lucide-react';

interface GoalTypeData {
  label: string;
  count: number;
}

interface GoalMethodData {
  river: GoalTypeData[];
  opponent: GoalTypeData[];
  since: string | null;
  total_cataloged: {
    river: number;
    opponent: number;
  };
}

interface GoalMethodAnalysisProps {
  filters: {
    q?: string;
    torneo?: string;
    adversario?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  };
}

const COLORS = ['#dc2626', '#18181b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'];

export default function GoalMethodAnalysis({ filters }: GoalMethodAnalysisProps) {
  const [data, setData] = useState<GoalMethodData | null>(null);
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stats/goals-by-type?${queryParams.toString()}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching goal methods:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [filters]);

  if (loading) {
    return (
      <div className="bg-white p-10 min-h-[400px] flex items-center justify-center border-t border-zinc-100">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Catalogando Formas...</p>
        </div>
      </div>
    );
  }

  if (!data || (data.total_cataloged.river === 0 && data.total_cataloged.opponent === 0)) {
    return null;
  }

  const riverData = data.river.map(item => ({ name: item.label, value: item.count }));
  const opponentData = data.opponent.map(item => ({ name: item.label, value: item.count }));

  return (
    <div className="bg-white p-8 md:p-10 border-t border-zinc-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Target size={28} />
          </div>
          <div>
            <h3 className="font-black text-xl text-zinc-900 tracking-tight uppercase">Forma de los Goles</h3>
            <p className="text-zinc-500 font-medium text-sm">
              Cómo se convirtieron los tantos en esta muestra.
            </p>
          </div>
        </div>
        {data.since && (
          <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center shadow-sm">
            <Info size={14} className="mr-2 text-amber-600" />
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
              Datos catalogados desde: {data.since}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* River Chart */}
        <div className="flex flex-col items-center">
          <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.2em] mb-8 bg-red-50 px-4 py-1.5 rounded-full">
            Goles a Favor ({data.total_cataloged.river})
          </h4>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riverData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riverData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Opponent Chart */}
        <div className="flex flex-col items-center">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em] mb-8 bg-zinc-100 px-4 py-1.5 rounded-full">
            Goles en Contra ({data.total_cataloged.opponent})
          </h4>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={opponentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {opponentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-start gap-3 bg-zinc-50 p-4 rounded-2xl">
        <ShieldAlert size={16} className="text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase">
          Nota: Esta sección analiza la muestra total de goles con detalle de tiempo registrado. Los goles marcados como &quot;Sin catalogar&quot; representan tantos cuya forma de conquista no fue especificada en el archivo histórico.
        </p>
      </div>
    </div>
  );
}
