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
  Users,
  Calendar,
  Sword,
  Activity,
  Timer
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

interface LatestMatch {
  fecha: string;
  go_ri: number;
  go_ad: number;
  resultado: 'G' | 'E' | 'P';
  rival: string;
  rival_escudo: string | null;
}

interface Comeback {
  fecha: string;
  resultado: string;
  rival: string;
  rival_escudo: string | null;
  torneo: string;
  dias_pasados: number;
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
  latest_brace: {
    jugador: string;
    jugador_id: number;
    fecha: string;
    rival: string;
    rival_escudo: string | null;
  } | null;
  latest_hat_trick: {
    jugador: string;
    jugador_id: number;
    fecha: string;
    rival: string;
    rival_escudo: string | null;
    goles_count: number;
  } | null;
  top_scorers_year: {
    pl_id: number;
    name: string;
    goals: number;
    pl_foto: string | null;
  }[] | null;
  top_results: {
    resultado: string;
    count: number;
    percentage: number;
    last_occurrence: {
      fecha: string;
      rival: string;
      torneo: string;
    } | null;
  }[] | null;
  latest_matches: LatestMatch[] | null;
  latest_comeback_home: Comeback | null;
  latest_comeback_away: Comeback | null;
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
          console.log('Stats Dashboard Data:', data);
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

        {/* New "Sabías que...?" Section */}
        {(curiosities.latest_brace || curiosities.latest_hat_trick || (curiosities.top_results && curiosities.top_results.length > 0)) && (
          <div className="mt-12 bg-zinc-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden border border-zinc-800 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap size={200} className="text-yellow-400" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-zinc-900">
                  <Zap size={20} className="fill-current" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Sabías que...? <span className="text-zinc-500 text-lg font-bold ml-2">Flashback Millonario</span></h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Latest Form Traffic Light (Semaforo) */}
                {curiosities.latest_matches && curiosities.latest_matches.length > 0 && (
                  <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group mb-4">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em] bg-yellow-400/10 px-3 py-1 rounded-full w-fit mb-2">Estado de Forma</span>
                        <h4 className="text-2xl font-black tracking-tight">Guía de Resultados Recientes</h4>
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

                    <div className="flex items-center justify-between gap-1 sm:gap-2">
                      {curiosities.latest_matches.map((match, idx) => (
                        <div key={idx} className="relative group/match flex-1 max-w-[40px]">
                          <div className={`aspect-square rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-110 cursor-help ${
                            match.resultado === 'G' ? 'bg-green-500 text-white shadow-green-900/20' :
                            match.resultado === 'P' ? 'bg-red-500 text-white shadow-red-900/20' :
                            'bg-zinc-600 text-white shadow-zinc-900/20'
                          }`}>
                            {match.resultado}
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-zinc-800 p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover/match:opacity-100 group-hover/match:visible transition-all z-50 border border-zinc-700 pointer-events-none">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[8px] font-black text-zinc-500 uppercase">{new Date(match.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                match.resultado === 'G' ? 'bg-green-500/20 text-green-400' :
                                match.resultado === 'P' ? 'bg-red-500/20 text-red-400' :
                                'bg-zinc-500/20 text-zinc-400'
                              }`}>
                                {match.go_ri} - {match.go_ad}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <ClubShield src={match.rival_escudo || undefined} className="w-6 h-6 shrink-0" />
                              <span className="text-xs font-black text-white truncate uppercase italic">{match.rival}</span>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45 -mt-1 border-r border-b border-zinc-700" />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="mt-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-4">
                      Secuencia cronológica de los últimos 20 encuentros oficiales (Izquierda: más antiguo • Derecha: más reciente)
                    </p>
                  </div>
                )}

                {/* Comebacks Section (Remontadas) */}
                {(curiosities.latest_comeback_home || curiosities.latest_comeback_away) && (
                  <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl mb-4 group hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-3 mb-8">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] bg-red-500/10 px-3 py-1 rounded-full">Épica Millonaria</span>
                      <h4 className="text-2xl font-black tracking-tight text-white italic">Últimas Remontadas Históricas</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Home Comeback */}
                      {curiosities.latest_comeback_home ? (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-black text-green-400 uppercase tracking-widest bg-green-400/10 px-2 py-0.5 rounded">En el Monumental</span>
                            <div className="flex items-center space-x-1.5 text-zinc-500">
                              <Timer size={12} />
                              <span className="text-[10px] font-black uppercase">Hace {curiosities.latest_comeback_home.dias_pasados} días</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="shrink-0 bg-white p-1.5 rounded-xl shadow-lg">
                              <ClubShield src={curiosities.latest_comeback_home.rival_escudo || undefined} className="w-10 h-10" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h5 className="text-lg font-black text-white truncate uppercase italic">{curiosities.latest_comeback_home.rival}</h5>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{new Date(curiosities.latest_comeback_home.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span className="text-[9px] font-black text-red-500/80 uppercase tracking-tighter truncate">{curiosities.latest_comeback_home.torneo}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-green-500 tracking-tighter">{curiosities.latest_comeback_home.resultado}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mt-auto">River logró revertir el marcador adverso y quedarse con los tres puntos en casa.</p>
                        </div>
                      ) : (
                        <div className="bg-white/5 p-6 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Sin registros recientes de local</div>
                      )}

                      {/* Away Comeback */}
                      {curiosities.latest_comeback_away ? (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5 rounded">Fuera de Casa</span>
                            <div className="flex items-center space-x-1.5 text-zinc-500">
                              <Timer size={12} />
                              <span className="text-[10px] font-black uppercase">Hace {curiosities.latest_comeback_away.dias_pasados} días</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="shrink-0 bg-white p-1.5 rounded-xl shadow-lg">
                              <ClubShield src={curiosities.latest_comeback_away.rival_escudo || undefined} className="w-10 h-10" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h5 className="text-lg font-black text-white truncate uppercase italic">{curiosities.latest_comeback_away.rival}</h5>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{new Date(curiosities.latest_comeback_away.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span className="text-[9px] font-black text-red-500/80 uppercase tracking-tighter truncate">{curiosities.latest_comeback_away.torneo}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-red-500 tracking-tighter">{curiosities.latest_comeback_away.resultado}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mt-auto">Triunfo agónico de visitante tras empezar perdiendo el encuentro.</p>
                        </div>
                      ) : (
                        <div className="bg-white/5 p-6 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Sin registros recientes de visitante</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Latest Brace */}
                {curiosities.latest_brace && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em] bg-yellow-400/10 px-3 py-1 rounded-full">Último Doblete</span>
                      <span className="text-xs font-bold text-zinc-500 tracking-tight">
                        {new Date(curiosities.latest_brace.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <h4 className="text-2xl font-black mb-1 group-hover:text-yellow-400 transition-colors tracking-tight">{curiosities.latest_brace.jugador}</h4>
                        <p className="text-zinc-400 font-medium leading-relaxed">Marcó dos goles ante <span className="text-white font-bold">{curiosities.latest_brace.rival}</span></p>
                      </div>
                      <div className="shrink-0 bg-white p-2 rounded-2xl shadow-xl shadow-black/20">
                        <ClubShield 
                          src={curiosities.latest_brace.rival_escudo || undefined} 
                          alt={curiosities.latest_brace.rival}
                          className="w-12 h-12"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Latest Hat-trick */}
                {curiosities.latest_hat_trick && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] bg-red-500/10 px-3 py-1 rounded-full">Último Hat-trick</span>
                        {curiosities.latest_hat_trick.goles_count > 3 && (
                          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full">{curiosities.latest_hat_trick.goles_count} Goles</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-zinc-500 tracking-tight">
                        {new Date(curiosities.latest_hat_trick.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <h4 className="text-2xl font-black mb-1 group-hover:text-red-50 transition-colors tracking-tight">{curiosities.latest_hat_trick.jugador}</h4>
                        <p className="text-zinc-400 font-medium leading-relaxed">Logró la hazaña ante <span className="text-white font-bold">{curiosities.latest_hat_trick.rival}</span></p>
                      </div>
                      <div className="shrink-0 bg-white p-2 rounded-2xl shadow-xl shadow-black/20">
                        <ClubShield 
                          src={curiosities.latest_hat_trick.rival_escudo || undefined} 
                          alt={curiosities.latest_hat_trick.rival}
                          className="w-12 h-12"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Scorers of the Year */}
                {curiosities.top_scorers_year && curiosities.top_scorers_year.length > 0 && (
                  <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group mb-4">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] bg-red-500/10 px-3 py-1 rounded-full w-fit mb-2">Artilleros {new Date().getFullYear()}</span>
                        <h4 className="text-2xl font-black tracking-tight">Goleadores del Año</h4>
                      </div>
                      <div className="flex items-center text-zinc-500">
                        <Calendar size={16} className="mr-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">Temporada Actual</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {curiosities.top_scorers_year.map((scorer, idx) => (
                        <div key={scorer.pl_id} className="relative bg-zinc-900/50 rounded-2xl p-4 border border-white/5 hover:border-red-500/30 transition-all group/scorer overflow-hidden">
                          {/* Position Badge */}
                          <div className={`absolute top-0 right-0 w-8 h-8 flex items-center justify-center font-black text-xs rounded-bl-xl z-20 ${
                            idx === 0 ? 'bg-yellow-500 text-zinc-900' :
                            idx === 1 ? 'bg-zinc-300 text-zinc-900' :
                            'bg-orange-700 text-white'
                          }`}>
                            #{idx + 1}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 border-2 border-white/10 group-hover/scorer:border-red-500/50 transition-colors">
                                {scorer.pl_foto ? (
                                  <img 
                                    src={scorer.pl_foto} 
                                    alt={scorer.name}
                                    className="w-full h-full object-cover object-top"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                    <Users size={24} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-black text-white truncate group-hover/scorer:text-red-50 transition-colors uppercase italic">{scorer.name}</h5>
                              <div className="flex items-center mt-1">
                                <Target size={12} className="text-red-500 mr-1.5 shrink-0" />
                                <span className="text-lg font-black text-white tracking-tighter">{scorer.goals}</span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase ml-1.5 tracking-widest">Goles</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Results */}
                {curiosities.top_results && curiosities.top_results.length > 0 && (
                  <div className="md:col-span-2 bg-gradient-to-r from-red-950/50 to-zinc-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:from-red-900/50 transition-all group">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full group-hover:text-red-400 transition-colors">Tendencia Histórica</span>
                      <h4 className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Marcadores más Repetidos</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {curiosities.top_results.map((item, index) => (
                        <div key={index} className="flex flex-col bg-white/5 p-6 rounded-2xl border border-white/5 group-hover:border-red-500/20 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Puesto #{index + 1}</span>
                              <span className="text-4xl font-black text-white tracking-tighter">{item.resultado}</span>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end space-x-2 mb-1">
                                <span className="text-xl font-black text-red-500">{item.count}</span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Partidos</span>
                              </div>
                              <span className="text-xs font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">{item.percentage}%</span>
                            </div>
                          </div>
                          
                          {item.last_occurrence && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center">
                                <History size={10} className="mr-1" /> Última Ocurrencia
                              </p>
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center text-xs text-zinc-300 font-medium">
                                  <Calendar size={12} className="mr-1.5 text-zinc-500" />
                                  {new Date(item.last_occurrence.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                                <div className="flex items-center text-xs text-zinc-300 font-medium">
                                  <Sword size={12} className="mr-1.5 text-zinc-500" />
                                  vs {item.last_occurrence.rival}
                                </div>
                                <div className="flex items-center text-[10px] text-zinc-500 font-bold uppercase truncate">
                                  <Award size={12} className="mr-1.5 text-zinc-600" />
                                  {item.last_occurrence.torneo}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 text-center md:text-left">
                      <p className="text-zinc-500 text-xs font-medium italic">
                        {curiosities.top_results.length > 1 && (
                          <>
                            Diferencia de solo <span className="text-white font-bold">{curiosities.top_results[0].count - curiosities.top_results[1].count}</span> partidos para un cambio en el podio histórico.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
