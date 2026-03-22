'use client';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';

const mockPerformanceData = [
  { year: '2014', effectiveness: 65 },
  { year: '2015', effectiveness: 72 },
  { year: '2016', effectiveness: 60 },
  { year: '2017', effectiveness: 68 },
  { year: '2018', effectiveness: 75 },
  { year: '2019', effectiveness: 70 },
  { year: '2020', effectiveness: 62 },
  { year: '2021', effectiveness: 78 },
  { year: '2022', effectiveness: 65 },
  { year: '2023', effectiveness: 68 },
];

const COLORS = ['#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'];

export default function PremiumStats() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Evolución de Efectividad Histórica</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Line 
                type="monotone" 
                dataKey="effectiveness" 
                stroke="#b91c1c" 
                strokeWidth={4} 
                dot={{r: 6, fill: '#b91c1c', strokeWidth: 2, stroke: '#fff'}}
                activeDot={{r: 8, strokeWidth: 0}}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribución de Títulos</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Nacionales', value: 38 },
                    { name: 'Internacionales', value: 18 },
                    { name: 'Copas Nac.', value: 16 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Goles por Periodo</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { period: '1T 0-15', goals: 120 },
                { period: '1T 15-30', goals: 145 },
                { period: '1T 30-45', goals: 160 },
                { period: '2T 45-60', goals: 130 },
                { period: '2T 60-75', goals: 180 },
                { period: '2T 75-90', goals: 210 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="goals" fill="#b91c1c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
