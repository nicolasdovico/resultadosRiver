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
  Calendar,
  Award,
  Sparkles,
  Scale,
  Search
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
  fases?: Option[];
  tecnicos?: Option[];
  isPremium?: boolean;
}

const CONDICION_OPTIONS: Option[] = [
  { id: '1', label: 'Local' },
  { id: '2', label: 'Visitante' },
  { id: '3', label: 'Neutral' },
];

const RESULTADO_OPTIONS: Option[] = [
  { id: 'G', label: 'Victorias (G)' },
  { id: 'E', label: 'Empates (E)' },
  { id: 'P', label: 'Derrotas (P)' },
];

export default function PartidoFilters({ 
  rivales, 
  estadios, 
  arbitros, 
  torneos, 
  niveles,
  fases = [],
  tecnicos = [],
  isPremium = true 
}: PartidoFiltersProps) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    adversario: searchParams.get('adversario') || '',
    torneo: searchParams.get('torneo') || '',
    torneo_nivel: searchParams.get('torneo_nivel') || '',
    fase: searchParams.get('fase') || '',
    estadio: searchParams.get('estadio') || '',
    arbitro: searchParams.get('arbitro') || '',
    tecnico: searchParams.get('tecnico') || '',
    condicion: searchParams.get('condicion') || '',
    resultado: searchParams.get('resultado') || '',
    fecha_desde: searchParams.get('fecha_desde') || '',
    fecha_hasta: searchParams.get('fecha_hasta') || '',
    q: searchParams.get('q') || '',
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
      torneo: '',
      torneo_nivel: '',
      fase: '',
      estadio: '',
      arbitro: '',
      tecnico: '',
      condicion: '',
      resultado: '',
      fecha_desde: '',
      fecha_hasta: '',
      q: '',
    };
    setFilters(resetFilters);

    const params = new URLSearchParams(searchParams);
    params.delete('adversario');
    params.delete('torneo');
    params.delete('torneo_nivel');
    params.delete('fase');
    params.delete('estadio');
    params.delete('arbitro');
    params.delete('tecnico');
    params.delete('condicion');
    params.delete('resultado');
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
            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Filtros Avanzados (12 Criterios)</h3>
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
        {/* 1. Rival */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">1. Rival</label>
          <SearchableSelect
            icon={Users}
            placeholder="Seleccionar Rival"
            value={filters.adversario}
            onChange={(val) => handleFilterChange('adversario', val)}
            options={rivales}
          />
        </div>
        
        {/* 2. Torneo */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">2. Torneo</label>
          <SearchableSelect
            icon={Trophy}
            placeholder="Seleccionar Torneo"
            value={filters.torneo}
            onChange={(val) => handleFilterChange('torneo', val)}
            options={torneos}
          />
        </div>

        {/* 3. Nivel de Torneo */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">3. Nivel</label>
          <SearchableSelect
            icon={Layers}
            placeholder="Nivel de Torneo"
            value={filters.torneo_nivel}
            onChange={(val) => handleFilterChange('torneo_nivel', val)}
            options={niveles.map(n => ({ id: n, label: n }))}
          />
        </div>

        {/* 4. Fase */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">4. Fase</label>
          <SearchableSelect
            icon={Award}
            placeholder="Seleccionar Fase"
            value={filters.fase}
            onChange={(val) => handleFilterChange('fase', val)}
            options={fases}
          />
        </div>

        {/* 5. Estadio */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">5. Estadio</label>
          <SearchableSelect
            icon={MapPin}
            placeholder="Seleccionar Estadio"
            value={filters.estadio}
            onChange={(val) => handleFilterChange('estadio', val)}
            options={estadios}
          />
        </div>

        {/* 6. Árbitro */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">6. Árbitro</label>
          <SearchableSelect
            icon={Scale}
            placeholder="Seleccionar Árbitro"
            value={filters.arbitro}
            onChange={(val) => handleFilterChange('arbitro', val)}
            options={arbitros}
          />
        </div>

        {/* 7. Director Técnico */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">7. Director Técnico</label>
          <SearchableSelect
            icon={UserCheck}
            placeholder="Seleccionar DT"
            value={filters.tecnico}
            onChange={(val) => handleFilterChange('tecnico', val)}
            options={tecnicos}
          />
        </div>

        {/* 8. Condición */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">8. Condición</label>
          <SearchableSelect
            icon={Home}
            placeholder="Local / Visitante"
            value={filters.condicion}
            onChange={(val) => handleFilterChange('condicion', val)}
            options={CONDICION_OPTIONS}
          />
        </div>

        {/* 9. Resultado */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">9. Resultado</label>
          <SearchableSelect
            icon={Sparkles}
            placeholder="Todos los Resultados"
            value={filters.resultado}
            onChange={(val) => handleFilterChange('resultado', val)}
            options={RESULTADO_OPTIONS}
          />
        </div>

        {/* 10. Fecha Desde */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">10. Fecha Desde</label>
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

        {/* 11. Fecha Hasta */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">11. Fecha Hasta</label>
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

        {/* 12. Búsqueda por texto */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">12. Búsqueda</label>
          <div className="relative group">
            <div className={`w-full bg-white border-2 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold transition-all outline-none flex items-center justify-between min-h-[52px] ${filters.q ? 'border-red-100 bg-red-50/30' : 'border-zinc-100 hover:border-zinc-200'}`}>
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${filters.q ? 'text-red-500' : 'text-zinc-400'}`} size={18} />
              <input 
                type="text" 
                placeholder="Rival o torneo..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full bg-transparent border-none outline-none text-zinc-900 text-xs font-bold"
              />
              {filters.q && (
                <div onClick={() => handleFilterChange('q', '')} className="p-1 hover:text-red-500 transition-colors text-zinc-300 absolute right-2 cursor-pointer z-10 bg-white/80 rounded-full">
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
    </div>
  );
}
