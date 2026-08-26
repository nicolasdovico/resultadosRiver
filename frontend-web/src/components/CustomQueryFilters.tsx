'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  UserCheck, 
  Trophy, 
  Layers, 
  X, 
  Filter,
  SlidersHorizontal,
  Home,
  Calendar,
  Search,
  Scale,
  Sparkles,
  Award
} from 'lucide-react';
import SearchableSelect from './ui/SearchableSelect';

interface Option {
  id: string | number;
  label: string;
}

interface CustomQueryFiltersProps {
  rivales: Option[];
  torneos: Option[];
  niveles: string[];
  fases: Option[];
  estadios: Option[];
  arbitros: Option[];
  tecnicos: Option[];
  isPremium: boolean;
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

export default function CustomQueryFilters({
  rivales,
  torneos,
  niveles,
  fases,
  estadios,
  arbitros,
  tecnicos,
  isPremium
}: CustomQueryFiltersProps) {
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

  useEffect(() => {
    setFilters({
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
  }, [searchParams]);

  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
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

    startTransition(() => {
      replace(pathname);
    });
  };

  const removeFilter = (name: string) => {
    handleFilterChange(name, '');
  };

  const nivelOptions: Option[] = niveles.map(n => ({ id: n, label: n }));

  const activeFiltersCount = Object.entries(filters).filter(([_, v]) => v !== '').length;

  // Active filter label helpers
  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case 'adversario': return `Rival: ${rivales.find(r => r.id.toString() === value)?.label || value}`;
      case 'torneo': return `Torneo: ${torneos.find(t => t.id.toString() === value)?.label || value}`;
      case 'torneo_nivel': return `Nivel: ${value}`;
      case 'fase': return `Fase: ${fases.find(f => f.id.toString() === value)?.label || value}`;
      case 'estadio': return `Estadio: ${estadios.find(e => e.id.toString() === value)?.label || value}`;
      case 'arbitro': return `Árbitro: ${arbitros.find(a => a.id.toString() === value)?.label || value}`;
      case 'tecnico': return `DT: ${tecnicos.find(t => t.id.toString() === value)?.label || value}`;
      case 'condicion': return `Condición: ${CONDICION_OPTIONS.find(c => c.id === value)?.label || value}`;
      case 'resultado': return `Resultado: ${RESULTADO_OPTIONS.find(r => r.id === value)?.label || value}`;
      case 'fecha_desde': return `Desde: ${value}`;
      case 'fecha_hasta': return `Hasta: ${value}`;
      case 'q': return `Búsqueda: "${value}"`;
      default: return `${key}: ${value}`;
    }
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-[40px] p-6 md:p-8 mb-12 shadow-xl shadow-zinc-900/5 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight italic">Consola de Filtros</h3>
              <span className="bg-yellow-400 text-yellow-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                👑 Premium Query
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
              Combina múltiples variables para consultar la base de datos histórica
            </p>
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-zinc-400 hover:text-red-600 font-black text-xs uppercase tracking-widest transition-colors group self-start md:self-auto"
          >
            <div className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-red-200 group-hover:bg-red-50 transition-all">
              <X size={14} />
            </div>
            Limpiar Todos ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Grid of Searchable Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 1. Rival */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Users size={12} className="text-red-500" /> Rival
          </label>
          <SearchableSelect
            icon={Users}
            placeholder="Todos los Rivales"
            value={filters.adversario}
            onChange={(val) => handleFilterChange('adversario', val)}
            options={rivales}
          />
        </div>

        {/* 2. Torneo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Trophy size={12} className="text-red-500" /> Torneo
          </label>
          <SearchableSelect
            icon={Trophy}
            placeholder="Todos los Torneos"
            value={filters.torneo}
            onChange={(val) => handleFilterChange('torneo', val)}
            options={torneos}
          />
        </div>

        {/* 3. Nivel de Torneo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Layers size={12} className="text-red-500" /> Nivel de Competencia
          </label>
          <SearchableSelect
            icon={Layers}
            placeholder="Todos los Niveles"
            value={filters.torneo_nivel}
            onChange={(val) => handleFilterChange('torneo_nivel', val)}
            options={nivelOptions}
          />
        </div>

        {/* 4. Fase */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Award size={12} className="text-red-500" /> Fase
          </label>
          <SearchableSelect
            icon={Award}
            placeholder="Todas las Fases"
            value={filters.fase}
            onChange={(val) => handleFilterChange('fase', val)}
            options={fases}
          />
        </div>

        {/* 5. Estadio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <MapPin size={12} className="text-red-500" /> Estadio / Sede
          </label>
          <SearchableSelect
            icon={MapPin}
            placeholder="Todos los Estadios"
            value={filters.estadio}
            onChange={(val) => handleFilterChange('estadio', val)}
            options={estadios}
          />
        </div>

        {/* 6. Árbitro */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Scale size={12} className="text-red-500" /> Árbitro
          </label>
          <SearchableSelect
            icon={Scale}
            placeholder="Todos los Árbitros"
            value={filters.arbitro}
            onChange={(val) => handleFilterChange('arbitro', val)}
            options={arbitros}
          />
        </div>

        {/* 7. Director Técnico */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <UserCheck size={12} className="text-red-500" /> Director Técnico
          </label>
          <SearchableSelect
            icon={UserCheck}
            placeholder="Todos los DTs"
            value={filters.tecnico}
            onChange={(val) => handleFilterChange('tecnico', val)}
            options={tecnicos}
          />
        </div>

        {/* 8. Condición */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Home size={12} className="text-red-500" /> Condición
          </label>
          <SearchableSelect
            icon={Home}
            placeholder="Todas las Condiciones"
            value={filters.condicion}
            onChange={(val) => handleFilterChange('condicion', val)}
            options={CONDICION_OPTIONS}
          />
        </div>

        {/* 9. Resultado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-red-500" /> Resultado
          </label>
          <SearchableSelect
            icon={Sparkles}
            placeholder="Todos los Resultados"
            value={filters.resultado}
            onChange={(val) => handleFilterChange('resultado', val)}
            options={RESULTADO_OPTIONS}
          />
        </div>

        {/* 10. Fecha Desde */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Calendar size={12} className="text-red-500" /> Fecha Desde
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.fecha_desde}
              onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
              className="w-full bg-white border-2 border-zinc-100 hover:border-zinc-200 focus:border-red-400 focus:ring-4 focus:ring-red-50 rounded-2xl py-3 px-4 text-xs font-bold text-zinc-800 transition-all outline-none min-h-[52px]"
            />
          </div>
        </div>

        {/* 11. Fecha Hasta */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Calendar size={12} className="text-red-500" /> Fecha Hasta
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.fecha_hasta}
              onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
              className="w-full bg-white border-2 border-zinc-100 hover:border-zinc-200 focus:border-red-400 focus:ring-4 focus:ring-red-50 rounded-2xl py-3 px-4 text-xs font-bold text-zinc-800 transition-all outline-none min-h-[52px]"
            />
          </div>
        </div>

        {/* 12. Búsqueda libre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center gap-1.5">
            <Search size={12} className="text-red-500" /> Búsqueda por texto
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              placeholder="Buscar por rival o torneo..."
              className="w-full bg-white border-2 border-zinc-100 hover:border-zinc-200 focus:border-red-400 focus:ring-4 focus:ring-red-50 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-zinc-800 transition-all outline-none min-h-[52px]"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            {filters.q && (
              <button
                onClick={() => handleFilterChange('q', '')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mr-2">
            Filtros Activos ({activeFiltersCount}):
          </span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 bg-zinc-900 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm"
              >
                {getFilterLabel(key, value)}
                <button
                  onClick={() => removeFilter(key)}
                  className="hover:text-red-400 transition-colors ml-0.5"
                  title="Eliminar filtro"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
