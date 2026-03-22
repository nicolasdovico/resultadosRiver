'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSetting } from '@/api/generated/endpoints/settings/settings';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      // @ts-expect-error - Resource structure
      setSettings(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    try {
      await updateSetting({ key, value });
      fetchSettings();
      alert('Configuración actualizada');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Configuración del Sistema</h1>

      <div className="space-y-6">
        {loading ? (
          <p>Cargando configuraciones...</p>
        ) : settings.map(setting => (
          <div key={setting.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{setting.key}</label>
            <div className="flex space-x-4">
              <input 
                type="text" 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2"
                defaultValue={setting.value}
                id={`input-${setting.key}`}
              />
              <button 
                onClick={() => {
                  const val = (document.getElementById(`input-${setting.key}`) as HTMLInputElement).value;
                  handleUpdate(setting.key, val);
                }}
                className="bg-slate-900 text-white font-bold py-2 px-6 rounded-lg hover:bg-black transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        ))}

        {!loading && settings.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-800">
            <p className="font-bold">No hay configuraciones inicializadas.</p>
            <p className="text-sm mt-1">Asegúrate de haber corrido los seeders en el backend.</p>
          </div>
        )}
      </div>
    </div>
  );
}
