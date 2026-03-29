'use client';

import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap, 
  Shield, 
  Award, 
  History,
  Users
} from 'lucide-react';
import ClubShield from './ClubShield';

interface Summary {
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  promedio_gol: number;
  efectividad: number;
}

interface Curiosity {
  biggest_win: {
    fecha: string;
    resultado: string;
    rival: string;
    torneo: string;
  } | null;
  most_frequent_rival: {
    nombre: string;
    partidos: number;
    escudo: string | null;
  } | null;
  most_active_year: {
    year: number;
    partidos: number;
  } | null;
  total_rivales: number;
  total_torneos: number;
}

interface GeneralStats {
  summary: Summary;
  curiosities: Curiosity;
}

export default function StatsDashboard() {
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stats/general`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching general stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="w-full h-64 bg-zinc-50 rounded-[40px] animate-pulse flex items-center justify-center">
        <span className="text-zinc-400 font-bold uppercase tracking-widest">Cargando Historia...</span>
      </div>
    );
  }

  const { summary, curiosities } = stats;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col mb-10">
          <h2 className="text-3xl font-black text-zinc-900 mb-2 uppercase tracking-tight">Resumen Histórico</h2>
          <p className="text-zinc-500 font-medium">Radiografía completa de la trayectoria del Más Grande.</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* PJ Card */}
          <div className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 group-hover:scale-110 transition-transform">
              <History size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Partidos Jugados</p>
              <h3 className="text-5xl font-black text-zinc-900 tracking-tighter mb-4">{summary.pj.toLocaleString()}</h3>
              <div className="flex items-center space-x-2">
                <div className="h-2 flex-1 bg-zinc-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-500" style={{ width: `${(summary.g/summary.pj)*100}%` }} title="Victorias" />
                  <div className="h-full bg-zinc-300" style={{ width: `${(summary.e/summary.pj)*100}%` }} title="Empates" />
                  <div className="h-full bg-red-500" style={{ width: `${(summary.p/summary.pj)*100}%` }} title="Derrotas" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[9px] font-black text-green-600 uppercase">G: {summary.g}</p>
                  <p className="text-[10px] font-bold text-zinc-400">{((summary.g / summary.pj) * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-500 uppercase">E: {summary.e}</p>
                  <p className="text-[10px] font-bold text-zinc-400">{((summary.e / summary.pj) * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-red-600 uppercase">P: {summary.p}</p>
                  <p className="text-[10px] font-bold text-zinc-400">{((summary.p / summary.pj) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Goles Card */}
          <div className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 group-hover:scale-110 transition-transform">
              <Target size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Goles Totales</p>
              <h3 className="text-5xl font-black text-zinc-900 tracking-tighter mb-4">{summary.gf.toLocaleString()}</h3>
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                  <span className="text-zinc-400">Favor</span>
                  <span className="text-zinc-900">{summary.gf}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                  <span className="text-zinc-400">Contra</span>
                  <span className="text-zinc-900">{summary.gc}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-zinc-50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-red-600 uppercase">Promedio</span>
                  <span className="text-sm font-black text-zinc-900">{summary.promedio_gol}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rendimiento Card */}
          <div className="bg-red-600 p-8 rounded-[32px] shadow-xl shadow-red-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:scale-110 transition-transform text-white">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-red-100 uppercase tracking-widest mb-1">Efectividad</p>
              <h3 className="text-5xl font-black text-white tracking-tighter mb-4">{summary.efectividad}%</h3>
              <p className="text-red-100 text-xs font-medium leading-tight">
                Basado en el sistema de 3 puntos por victoria, este es el rendimiento histórico del club.
              </p>
              <div className="mt-6 inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <Zap size={12} className="text-yellow-400 mr-2" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Ritmo Ganador</span>
              </div>
            </div>
          </div>

          {/* Diversidad Card */}
          <div className="bg-zinc-900 p-8 rounded-[32px] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:scale-110 transition-transform text-white">
              <Shield size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Enfrentamientos</p>
              <h3 className="text-5xl font-black text-white tracking-tighter mb-4">{curiosities.total_rivales}</h3>
              <p className="text-zinc-400 text-xs font-medium mb-6">
                Equipos distintos enfrentados en {curiosities.total_torneos} torneos registrados.
              </p>
              <div className="flex items-center text-zinc-500 font-bold text-[10px] uppercase tracking-widest border-t border-white/5 pt-4">
                <Award size={14} className="mr-2 text-yellow-500" />
                Archivo Completo
              </div>
            </div>
          </div>
        </div>

        {/* Facts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {curiosities.biggest_win && (
            <div className="lg:col-span-2 bg-zinc-50 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 border border-zinc-100">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg text-red-600 shrink-0 border border-zinc-50">
                <Trophy size={32} />
              </div>
              <div className="text-center md:text-left flex-1">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Mayor Goleada Histórica</p>
                <h4 className="text-2xl font-black text-zinc-900 mb-2">
                  River Plate {curiosities.biggest_win.resultado} {curiosities.biggest_win.rival}
                </h4>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <span className="text-xs font-bold text-zinc-500 flex items-center">
                    <History size={14} className="mr-1.5" />
                    {curiosities.biggest_win.fecha}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 flex items-center">
                    <Award size={14} className="mr-1.5" />
                    {curiosities.biggest_win.torneo}
                  </span>
                </div>
              </div>
            </div>
          )}

          {curiosities.most_frequent_rival && (
            <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm flex flex-col items-center text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Rival más Frecuente</p>
              <div className="mb-4">
                <ClubShield 
                  src={curiosities.most_frequent_rival.escudo || undefined} 
                  alt={curiosities.most_frequent_rival.nombre}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h4 className="text-xl font-black text-zinc-900 tracking-tight uppercase mb-1">
                {curiosities.most_frequent_rival.nombre}
              </h4>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">
                {curiosities.most_frequent_rival.partidos} encuentros disputados
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
