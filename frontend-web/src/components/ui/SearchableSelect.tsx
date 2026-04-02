'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Star } from 'lucide-react';

interface Option {
  id: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder: string;
  icon: any;
  disabled?: boolean;
  isPremium?: boolean;
  requiredPremium?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled = false,
  isPremium = true,
  requiredPremium = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.id.toString() === value.toString()),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled || (!isPremium && requiredPremium)) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSelect = (option: Option) => {
    onChange(option.id.toString());
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const isRestricted = !isPremium && requiredPremium;

  return (
    <div className="relative group" ref={containerRef}>
      {/* Premium Badge Overlay */}
      {isRestricted && (
        <div className="absolute -top-2 -right-1 z-10">
          <span className="bg-zinc-900 text-[8px] text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm flex items-center gap-1">
            <Star size={8} className="fill-yellow-400 text-yellow-400" />
            Premium
          </span>
        </div>
      )}

      {/* Main Control */}
      <div
        onClick={handleToggle}
        className={`w-full bg-white border-2 rounded-2xl py-3.5 pl-12 pr-10 text-sm font-bold transition-all outline-none flex items-center justify-between min-h-[52px]
          ${isOpen ? 'border-red-400 ring-4 ring-red-50' : value ? 'border-red-100 bg-red-50/30' : 'border-zinc-100 hover:border-zinc-200'}
          ${disabled || isRestricted ? 'opacity-50 cursor-not-allowed bg-zinc-50' : 'cursor-pointer'}
        `}
      >
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${value || isOpen ? 'text-red-500' : 'text-zinc-400'}`}>
          <Icon size={18} />
        </div>

        <div className="flex-1 truncate mr-2">
          {selectedOption ? (
            <span className="text-zinc-900">{selectedOption.label}</span>
          ) : (
            <span className="text-zinc-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-zinc-300">
          {value && !disabled && !isRestricted && (
            <div 
              onClick={clearSelection}
              className="p-1 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </div>
          )}
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-400' : ''}`} 
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-xl shadow-zinc-200/50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-zinc-50 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escribe para buscar..."
                className="w-full bg-zinc-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-red-100 transition-all"
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between
                    ${value.toString() === option.id.toString() 
                      ? 'bg-red-50 text-red-600' 
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {value.toString() === option.id.toString() && (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">No se encontraron resultados</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
