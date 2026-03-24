'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = "Buscar...", className = "" }: SearchBarProps) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-zinc-100 border-none rounded-2xl py-3 pl-10 pr-10 text-sm font-medium focus:ring-2 focus:ring-red-500 transition-all outline-none"
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div className="absolute left-3 top-3.5 text-zinc-400">
        {isPending ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Search size={16} />
        )}
      </div>
      {isPending && (
        <div className="absolute right-3 top-3.5">
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest animate-pulse">Buscando</span>
        </div>
      )}
    </div>
  );
}
