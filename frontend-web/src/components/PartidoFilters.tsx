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
  Loader2
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
    };
    setFilters(resetFilters);

    const params = new URLSearchParams(searchParams);
    params.delete('adversario');
    params.delete('estadio');
    params.delete('arbitro');
    params.delete('torneo');
    params.delete('torneo_nivel');
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <SearchableSelect
          icon={Users}
          placeholder="Rival"
          value={filters.adversario}
          onChange={(val) => handleFilterChange('adversario', val)}
          options={rivales}
        />
        
        <SearchableSelect
          icon={Trophy}
          placeholder="Torneo"
          value={filters.torneo}
          onChange={(val) => handleFilterChange('torneo', val)}
          options={torneos}
        />

        <SearchableSelect
          icon={Layers}
          placeholder="Nivel"
          value={filters.torneo_nivel}
          onChange={(val) => handleFilterChange('torneo_nivel', val)}
          options={niveles.map(n => ({ id: n, label: n }))}
          isPremium={isPremium}
          requiredPremium={true}
        />

        <SearchableSelect
          icon={MapPin}
          placeholder="Estadio"
          value={filters.estadio}
          onChange={(val) => handleFilterChange('estadio', val)}
          options={estadios}
          isPremium={isPremium}
          requiredPremium={true}
        />

        <SearchableSelect
          icon={UserCheck}
          placeholder="Árbitro"
          value={filters.arbitro}
          onChange={(val) => handleFilterChange('arbitro', val)}
          options={arbitros}
          isPremium={isPremium}
          requiredPremium={true}
        />
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
