'use client';

import { useState, useEffect } from 'react';
import { getTorneos } from '@/api/generated/endpoints/torneos/torneos';
import { getRivales } from '@/api/generated/endpoints/rivales/rivales';
import { getEstadios } from '@/api/generated/endpoints/estadios/estadios';
import { getArbitros } from '@/api/generated/endpoints/arbitros/arbitros';
import { createPartido } from '@/api/generated/endpoints/partidos/partidos';

export default function AdminPartidos() {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [rivales, setRivales] = useState<any[]>([]);
  const [estadios, setEstadios] = useState<any[]>([]);
  const [arbitros, setArbitros] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    fecha: '',
    torneo: '',
    adversario: '',
    estadio: '',
    arbitro: '',
    goles_river: 0,
    goles_rival: 0,
    condicion: '1', // 1: Local, 2: Visitante, 3: Neutral
    fase: '1',
  });

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      const [t, r, e, a] = await Promise.all([
        getTorneos(),
        getRivales(),
        getEstadios(),
        getArbitros()
      ]);
      // @ts-expect-error - Resource structure
      setTorneos(t.data || []);
      // @ts-expect-error - Resource structure
      setRivales(r.data || []);
      // @ts-expect-error - Resource structure
      setEstadios(e.data || []);
      // @ts-expect-error - Resource structure
      setArbitros(a.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      // @ts-expect-error - API structure
      await createPartido(formData);
      alert('Partido cargado exitosamente');
      setFormData({
        fecha: '',
        torneo: '',
        adversario: '',
        estadio: '',
        arbitro: '',
        goles_river: 0,
        goles_rival: 0,
        condicion: '1',
        fase: '1',
      });
    } catch (error) {
      console.error(error);
      alert('Error al cargar partido');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Cargar Nuevo Partido</h1>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Fecha del Encuentro</label>
            <input 
              type="date" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Torneo</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              value={formData.torneo}
              onChange={(e) => setFormData({...formData, torneo: e.target.value})}
            >
              <option value="">Seleccionar torneo</option>
              {torneos.map(t => <option key={t.id} value={t.id}>{t.tor_nombre}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rival</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              value={formData.adversario}
              onChange={(e) => setFormData({...formData, adversario: e.target.value})}
            >
              <option value="">Seleccionar rival</option>
              {rivales.map(r => <option key={r.id} value={r.id}>{r.riv_nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estadio</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
              value={formData.estadio}
              onChange={(e) => setFormData({...formData, estadio: e.target.value})}
            >
              <option value="">Seleccionar estadio</option>
              {estadios.map(e => <option key={e.id} value={e.id}>{e.est_nombre}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-around">
          <div className="text-center">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Goles River</label>
            <input 
              type="number" 
              className="w-20 text-center text-3xl font-black bg-white border border-slate-200 rounded-xl py-2"
              value={formData.goles_river}
              onChange={(e) => setFormData({...formData, goles_river: parseInt(e.target.value)})}
            />
          </div>
          <div className="text-4xl font-black text-slate-300">-</div>
          <div className="text-center">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Goles Rival</label>
            <input 
              type="number" 
              className="w-20 text-center text-3xl font-black bg-white border border-slate-200 rounded-xl py-2"
              value={formData.goles_rival}
              onChange={(e) => setFormData({...formData, goles_rival: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-lg shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
        >
          Guardar Partido
        </button>
      </div>
    </div>
  );
}
