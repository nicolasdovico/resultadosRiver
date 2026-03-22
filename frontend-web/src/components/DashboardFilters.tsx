'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface FiltersProps {
  torneos: { id: number; tor_nombre: string }[];
  rivales: { id: number; riv_nombre: string }[];
  tecnicos: { id: number; tec_nombre: string }[];
}

export default function DashboardFilters({ torneos, rivales, tecnicos }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.push(`/?${createQueryString(name, value)}`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Filtrar Resultados</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Nivel de Torneo</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            onChange={(e) => handleFilterChange('torneo_nivel', e.target.value)}
            value={searchParams.get('torneo_nivel') || ''}
          >
            <option value="">Todos los niveles</option>
            <option value="1">Nivel 1 (Nacional)</option>
            <option value="2">Nivel 2 (Internacional)</option>
            <option value="3">Nivel 3 (Amistoso)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Torneo Específico</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            onChange={(e) => handleFilterChange('torneo', e.target.value)}
            value={searchParams.get('torneo') || ''}
          >
            <option value="">Cualquier torneo</option>
            {torneos.map(t => (
              <option key={t.id} value={t.id}>{t.tor_nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Rival</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            onChange={(e) => handleFilterChange('adversario', e.target.value)}
            value={searchParams.get('adversario') || ''}
          >
            <option value="">Cualquier rival</option>
            {rivales.map(r => (
              <option key={r.id} value={r.id}>{r.riv_nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Director Técnico</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            onChange={(e) => handleFilterChange('tecnico', e.target.value)}
            value={searchParams.get('tecnico') || ''}
          >
            <option value="">Cualquier técnico</option>
            {tecnicos.map(tec => (
              <option key={tec.id} value={tec.id}>{tec.tec_nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end md:col-span-4 justify-end mt-4">
          <button 
            onClick={() => router.push('/')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-6 rounded-lg text-sm transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
