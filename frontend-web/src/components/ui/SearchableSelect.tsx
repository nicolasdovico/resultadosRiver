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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.id.toString() === value?.toString()),
    [options, value]
  );

  // Intelligent ranking:
  // 1. Starts with search term
  // 2. Any word inside label starts with search term
  // 3. Contains search term anywhere
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options;

    const startsWith: Option[] = [];
    const wordStartsWith: Option[] = [];
    const contains: Option[] = [];

    for (const opt of options) {
      const label = opt.label.toLowerCase();
      if (label.startsWith(term)) {
        startsWith.push(opt);
      } else if (label.split(/\s+/).some((word) => word.startsWith(term))) {
        wordStartsWith.push(opt);
      } else if (label.includes(term)) {
        contains.push(opt);
      }
    }

    return [...startsWith, ...wordStartsWith, ...contains];
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled || (!isPremium && requiredPremium)) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setHighlightedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  };

  const handleSelect = (option: Option) => {
    onChange(option.id.toString());
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const scrollIndexIntoView = (index: number) => {
    if (!listRef.current) return;
    const element = listRef.current.children[index] as HTMLElement;
    if (element) {
      element.scrollIntoView({ block: 'nearest' });
    }
  };

  // Helper to render text with highlighted search query
  const renderHighlighted = (text: string, query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return text;

    const regex = new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-red-600 bg-red-50/80 px-0.5 rounded font-black">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const isRestricted = !isPremium && requiredPremium;

  return (
    <div className="relative group" ref={containerRef} onKeyDown={handleKeyDown}>
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
              title="Limpiar selección"
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
        <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-200/80 rounded-2xl shadow-2xl shadow-zinc-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-zinc-100 sticky top-0 bg-white z-10">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-zinc-400 pointer-events-none" size={14} />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder="Escribe para buscar..."
                className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl py-2 pl-9 pr-16 text-xs font-bold text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-full transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="flex items-center justify-between px-2 pt-1.5 text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                <span>Resultados</span>
                <span className="text-zinc-600">{filteredOptions.length} encontrados</span>
              </div>
            )}
          </div>
          
          {/* Options List */}
          <div 
            ref={listRef}
            className="max-h-72 overflow-y-auto custom-scrollbar p-1"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => {
                const isSelected = value?.toString() === option.id.toString();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-between my-0.5
                      ${isSelected 
                        ? 'bg-red-50 text-red-600 font-black' 
                        : isHighlighted
                        ? 'bg-zinc-100 text-zinc-900'
                        : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'}
                    `}
                  >
                    <span className="truncate flex-1 mr-2">
                      {renderHighlighted(option.label, searchTerm)}
                    </span>
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                  No se encontraron resultados para &quot;{searchTerm}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
