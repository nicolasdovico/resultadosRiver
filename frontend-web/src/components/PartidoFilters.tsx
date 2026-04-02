'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import { 
  Users, 
  MapPin, 
  UserCheck, 
  Trophy, 
  Layers, 
  X, 
  Filter,
  Loader2,
  Home,
  Calendar
} from 'lucide-react';
import SearchableSelect from './ui/SearchableSelect';

interface Option {
  id: string | number;
  label: string;
}

interface PartidoFiltersProps {
  rivales: Option[];
  estadios: Option[];
  arbitros: Option[];
  torneos: Option[];
  niveles: string[];
  isPremium: boolean;
}

export default function PartidoFilters({ 
  rivales, 
  estadios, 
  arbitros, 
  torneos, 
  niveles,
  isPremium 
}: PartidoFiltersProps) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    adversario: searchParams.get('adversario') || '',
    estadio: searchParams.get('estadio') || '',
    arbitro: searchParams.get('arbitro') || '',
    torneo: searchParams.get('torneo') || '',
    torneo_nivel: searchParams.get('torneo_nivel') || '',
    condicion: searchParams.get('condicion') || '',
    fecha_desde: searchParams.get('fecha_desde') || '',
    fecha_hasta: searchParams.get('fecha_hasta') || '',
  });

  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Reset page when filtering
    params.delete('page');

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    const resetFilters = {
      adversario: '',
      estadio: '',
      arbitro: '',
      torneo: '',
      torneo_nivel: '',
      condicion: '',
      fecha_desde: '',
      fecha_hasta: '',
    };
    setFilters(resetFilters);

    const params = new URLSearchParams(searchParams);
    params.delete('adversario');
    params.delete('estadio');
    params.delete('arbitro');
    params.delete('torneo');
    params.delete('torneo_nivel');
    params.delete('condicion');
    params.delete('fecha_desde');
    params.delete('fecha_hasta');
    params.delete('page');
    params.delete('q');

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '') || searchParams.has('q');

  return (
    <div className="bg-zinc-50/50 border border-zinc-100 rounded-[40px] p-8 mb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-zinc-100">
            <Filter size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Filtros Avanzados</h3>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Personaliza tu consulta histórica</p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-zinc-400 hover:text-red-600 font-black text-[10px] uppercase tracking-widest transition-colors group"
          >
            <div className="w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-red-200 group-hover:bg-red-50 transition-all">
              <X size={12} />
            </div>
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-6">
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Rival</label>
          <SearchableSelect
            icon={Users}
            placeholder="Seleccionar Rival"
            value={filters.adversario}
            onChange={(val) => handleFilterChange('adversario', val)}
            options={rivales}
          />
        </div>
        
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Torneo</label>
          <SearchableSelect
            icon={Trophy}
            placeholder="Seleccionar Torneo"
            value={filters.torneo}
            onChange={(val) => handleFilterChange('torneo', val)}
            options={torneos}
          />
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Nivel</label>
          <SearchableSelect
            icon={Layers}
            placeholder="Nivel de Torneo"
            value={filters.torneo_nivel}
            onChange={(val) => handleFilterChange('torneo_nivel', val)}
            options={niveles.map(n => ({ id: n, label: n }))}
            isPremium={isPremium}
            requiredPremium={true}
          />
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Condición</label>
          <SearchableSelect
            icon={Home}
            placeholder="Local / Visitante"
            value={filters.condicion}
            onChange={(val) => handleFilterChange('condicion', val)}
            options={[
              { id: '1', label: 'Local' },
              { id: '2', label: 'Visitante' },
              { id: '3', label: 'Neutral' },
            ]}
          />
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Estadio</label>
          <SearchableSelect
            icon={MapPin}
            placeholder="Seleccionar Estadio"
            value={filters.estadio}
            onChange={(val) => handleFilterChange('estadio', val)}
            options={estadios}
            isPremium={isPremium}
            requiredPremium={true}
          />
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Árbitro</label>
          <SearchableSelect
            icon={UserCheck}
            placeholder="Seleccionar Árbitro"
            value={filters.arbitro}
            onChange={(val) => handleFilterChange('arbitro', val)}
            options={arbitros}
            isPremium={isPremium}
            requiredPremium={true}
          />
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Fecha Desde</label>
          <div className="relative group">
            <div className={`w-full bg-white border-2 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold transition-all outline-none flex items-center justify-between min-h-[52px] ${filters.fecha_desde ? 'border-red-100 bg-red-50/30' : 'border-zinc-100 hover:border-zinc-200'}`}>
              <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 ${filters.fecha_desde ? 'text-red-500' : 'text-zinc-400'}`} size={18} />
              <input 
                type="date" 
                value={filters.fecha_desde}
                onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                className="w-full bg-transparent border-none outline-none text-zinc-900 cursor-pointer text-xs"
              />
              {filters.fecha_desde && (
                <div onClick={() => handleFilterChange('fecha_desde', '')} className="p-1 hover:text-red-500 transition-colors text-zinc-300 absolute right-2 cursor-pointer z-10 bg-white/80 rounded-full">
                  <X size={14} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Fecha Hasta</label>
          <div className="relative group">
            <div className={`w-full bg-white border-2 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold transition-all outline-none flex items-center justify-between min-h-[52px] ${filters.fecha_hasta ? 'border-red-100 bg-red-50/30' : 'border-zinc-100 hover:border-zinc-200'}`}>
              <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 ${filters.fecha_hasta ? 'text-red-500' : 'text-zinc-400'}`} size={18} />
              <input 
                type="date" 
                value={filters.fecha_hasta}
                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                className="w-full bg-transparent border-none outline-none text-zinc-900 cursor-pointer text-xs"
              />
              {filters.fecha_hasta && (
                <div onClick={() => handleFilterChange('fecha_hasta', '')} className="p-1 hover:text-red-500 transition-colors text-zinc-300 absolute right-2 cursor-pointer z-10 bg-white/80 rounded-full">
                  <X size={14} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center justify-center mt-6 gap-2">
          <Loader2 className="animate-spin text-red-500" size={16} />
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest animate-pulse">Actualizando resultados...</span>
        </div>
      )}
      
      {!isPremium && (
        <div className="mt-6 flex items-center justify-center">
          <div className="bg-white border border-zinc-100 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse" />
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              Desbloquea todos los filtros con una cuenta <span className="text-zinc-900 font-black">Premium</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
