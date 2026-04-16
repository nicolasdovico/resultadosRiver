'use client';

import { Flame, Calendar, Trophy, Zap, Shield } from "lucide-react";
import { formatLocalDate } from "@/utils/date";
import Link from "next/link";
import Image from "next/image";
import ClubShield from "../ClubShield";

interface StreakMatch {
  fecha: string;
  rival: string;
  rival_escudo: string | null;
  resultado: string; // G, E, P
  marcador: string;
  goles_jugador: number;
}

interface ScoringStreak {
  max_matches: number;
  start_date: string | null;
  end_date: string | null;
  total_goals: number;
  matches: StreakMatch[];
}

interface PlayerScoringStreakProps {
  streak: ScoringStreak | null;
  isPremium: boolean;
  playerName: string;
}

export default function PlayerScoringStreak({ streak, isPremium, playerName }: PlayerScoringStreakProps) {
  if (!streak || streak.max_matches <= 1) return null;

  return (
    <div className="bg-white p-8 md:p-12 border-b border-zinc-100 last:border-0 relative">
      {/* Background Decorative Element - Now adjusted to not interfere with tooltips if possible */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12 overflow-hidden">
        <Flame size={240} className="text-red-600" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <Flame size={20} className="fill-current" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic">Racha Goleadora Máxima</h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Partidos oficiales consecutivos anotando para River</p>
          </div>
        </div>

        {/* Semaphore Section - REPLICATED FROM StatsDashboard */}
        <div className="relative mb-12">
          {!isPremium && (
            <div className="absolute inset-0 z-20 backdrop-blur-xl bg-white/40 flex flex-col items-center justify-center p-6 text-center rounded-[32px] border-2 border-dashed border-red-100 shadow-xl">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg rotate-3">
                <Shield size={24} className="text-white" />
              </div>
              <h4 className="font-black text-zinc-900 uppercase tracking-tighter text-2xl mb-2 italic">Hito Histórico</h4>
              <p className="text-zinc-500 text-xs font-medium mb-6 max-w-xs leading-relaxed">
                Descubre los partidos, rivales y resultados de la racha más implacable de <span className="text-zinc-900 font-bold">{playerName}</span>. Solo para miembros <span className="text-red-600 font-bold italic">Premium</span>.
              </p>
              <Link href="/premium" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg">
                Desbloquear Racha
              </Link>
            </div>
          )}

          <div className={`bg-zinc-50 border border-zinc-100 p-8 rounded-[32px] hover:bg-zinc-100/50 transition-colors group/streak ${!isPremium ? 'blur-sm grayscale opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] bg-red-50 px-3 py-1 rounded-full w-fit mb-2 border border-red-100">Secuencia de Goles</span>
                <h4 className="text-xl font-black text-zinc-900 tracking-tight uppercase italic">Guía de la Racha Máxima</h4>
              </div>
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase">Victoria</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-zinc-500 rounded-full" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase">Empate</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase">Derrota</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 overflow-visible">
              {streak.matches.map((match, idx) => (
                <div key={idx} className="relative group/match flex-1 max-w-[40px]">
                  <div className={`aspect-square rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-110 cursor-help ${
                    match.resultado === 'G' ? 'bg-green-500 text-white shadow-green-900/20' :
                    match.resultado === 'P' ? 'bg-red-500 text-white shadow-red-900/20' :
                    'bg-zinc-600 text-white shadow-zinc-900/20'
                  }`}>
                    {match.resultado}
                  </div>
                  
                  {/* Tooltip (Exactly as StatsDashboard) */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-zinc-800 p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover/match:opacity-100 group-hover/match:visible transition-all z-50 border border-zinc-700 pointer-events-none">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[8px] font-black text-zinc-500 uppercase">
                        {new Date(match.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        match.resultado === 'G' ? 'bg-green-500/20 text-green-400' :
                        match.resultado === 'P' ? 'bg-red-500/20 text-red-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {match.marcador}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <ClubShield src={match.rival_escudo || undefined} className="w-6 h-6 shrink-0" />
                      <span className="text-xs font-black text-white truncate uppercase italic">{match.rival}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2">
                       <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Goles:</span>
                       <span className="text-[10px] font-black text-red-500">{match.goles_jugador}</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45 -mt-1 border-r border-b border-zinc-700" />
                  </div>
                </div>
              ))}
            </div>
            
            <p className="mt-8 text-[9px] font-bold text-zinc-400 uppercase tracking-widest border-t border-zinc-100 pt-4 italic">
              Cronología de la racha máxima: {streak.max_matches} partidos consecutivos aportando a la red.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${!isPremium ? 'opacity-20 grayscale blur-sm pointer-events-none select-none' : ''}`}>
            {/* Big Stat */}
            <div className="bg-zinc-900 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-2xl border-4 border-white">
              <span className="text-6xl font-black text-white italic tracking-tighter mb-2">
                {streak.max_matches}
              </span>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Partidos Seguidos</span>
            </div>

            {/* Total Goals in Streak */}
            <div className="bg-white rounded-[32px] p-8 flex flex-col items-center justify-center text-center border border-zinc-100 group hover:border-red-100 transition-colors shadow-sm">
              <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center shadow-inner mb-4 group-hover:scale-110 transition-transform">
                <Zap size={20} className="text-yellow-500 fill-current" />
              </div>
              <span className="text-3xl font-black text-zinc-900 tabular-nums">
                {streak.total_goals}
              </span>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Goles en la Racha</span>
            </div>

            {/* Start Date */}
            <div className="bg-white rounded-[32px] p-8 flex flex-col items-center justify-center text-center border border-zinc-100 group hover:border-red-100 transition-colors shadow-sm">
              <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center shadow-inner mb-4 group-hover:scale-110 transition-transform">
                <Calendar size={20} className="text-red-600" />
              </div>
              <span className="text-sm font-black text-zinc-900 uppercase">
                {streak.start_date ? formatLocalDate(streak.start_date) : '-'}
              </span>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Inicio de Racha</span>
            </div>

            {/* End Date */}
            <div className="bg-white rounded-[32px] p-8 flex flex-col items-center justify-center text-center border border-zinc-100 group hover:border-red-100 transition-colors shadow-sm">
              <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center shadow-inner mb-4 group-hover:scale-110 transition-transform">
                <Trophy size={20} className="text-red-600" />
              </div>
              <span className="text-sm font-black text-zinc-900 uppercase">
                {streak.end_date ? formatLocalDate(streak.end_date) : '-'}
              </span>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Fin de Racha</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
