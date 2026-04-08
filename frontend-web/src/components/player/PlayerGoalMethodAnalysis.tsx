'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target, ShieldAlert } from 'lucide-react';

interface GoalType {
  label: string;
  value: number;
  value_rival?: number;
}

interface PlayerGoalMethodAnalysisProps {
  data: GoalType[];
  total: number;
}

const COLORS_RIVER = ['#dc2626', '#ef4444', '#f87171', '#fb923c', '#facc15', '#a3e635'];
const COLORS_RIVAL = ['#18181b', '#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8'];

export default function PlayerGoalMethodAnalysis({ data, total }: PlayerGoalMethodAnalysisProps) {
  if (total === 0 || data.length === 0) {
    return null;
  }

  // Preparamos datos para dos anillos o un solo gráfico combinado con leyenda clara
  const hasRiverGoals = data.some(item => (item.value || 0) > 0);
  const hasRivalGoals = data.some(item => (item.value_rival || 0) > 0);

  const riverData = data
    .filter(item => (item.value || 0) > 0)
    .map(item => ({ name: `${item.label} (River)`, value: Number(item.value) }));

  const rivalData = data
    .filter(item => (item.value_rival || 0) > 0)
    .map(item => ({ name: `${item.label} (Rival)`, value: Number(item.value_rival) }));

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
              Análisis del método de definición por bando.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hasRiverGoals && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Para River</span>
            </div>
          )}
          {hasRivalGoals && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-zinc-900 rounded-full" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contra River</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Anillo Exterior: Goles River */}
              {hasRiverGoals && (
                <Pie
                  data={riverData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={115}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riverData.map((entry, index) => (
                    <Cell key={`cell-river-${index}`} fill={COLORS_RIVER[index % COLORS_RIVER.length]} />
                  ))}
                </Pie>
              )}
              
              {/* Anillo Interior: Goles Rival */}
              {hasRivalGoals && (
                <Pie
                  data={rivalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {rivalData.map((entry, index) => (
                    <Cell key={`cell-rival-${index}`} fill={COLORS_RIVAL[index % COLORS_RIVAL.length]} />
                  ))}
                </Pie>
              )}

              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
              />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '30px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-12 flex items-start gap-3 bg-zinc-50 p-4 rounded-2xl">
        <ShieldAlert size={16} className="text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase">
          Nota: Los anillos diferencian la producción ofensiva según la camiseta defendida. El anillo exterior rojo representa goles <span className="text-red-600 font-bold">para River</span>, y el interior oscuro los goles <span className="text-zinc-900 font-bold">contra River</span>.
        </p>
      </div>
    </div>
  );
}
