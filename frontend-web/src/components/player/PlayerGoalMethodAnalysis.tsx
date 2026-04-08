'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target, ShieldAlert } from 'lucide-react';

interface GoalType {
  label: string;
  value: number;
}

interface PlayerGoalMethodAnalysisProps {
  data: GoalType[];
  total: number;
}

const COLORS = ['#dc2626', '#18181b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'];

export default function PlayerGoalMethodAnalysis({ data, total }: PlayerGoalMethodAnalysisProps) {
  if (total === 0 || data.length === 0) {
    return null;
  }

  const chartData = data.map(item => ({ name: item.label, value: item.value }));

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
              Cómo se convirtieron los tantos en la carrera del jugador.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.2em] mb-8 bg-red-50 px-4 py-1.5 rounded-full">
          Goles por Método ({total})
        </h4>
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
              />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '30px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-12 flex items-start gap-3 bg-zinc-50 p-4 rounded-2xl">
        <ShieldAlert size={16} className="text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase">
          Nota: Esta sección analiza la muestra total de goles catalogados. Algunos goles antiguos pueden no tener el método de definición especificado en el archivo histórico.
        </p>
      </div>
    </div>
  );
}
