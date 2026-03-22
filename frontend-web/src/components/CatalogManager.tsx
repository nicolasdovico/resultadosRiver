'use client';

import { useState, useEffect } from 'react';

interface CatalogManagerProps {
  title: string;
  fetchFn: () => Promise<any>;
  createFn: (data: any) => Promise<any>;
  deleteFn: (id: number) => Promise<any>;
  nameField: string;
}

export default function CatalogManager({ title, fetchFn, createFn, deleteFn, nameField }: CatalogManagerProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetchFn();
      // @ts-expect-error - Resource structure
      setItems(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newItemName) return;
    try {
      await createFn({ [nameField]: newItemName });
      setNewItemName('');
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro?')) return;
    try {
      await deleteFn(id);
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Administrar {title}</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Nuevo Registro</h2>
        <div className="flex space-x-4">
          <input 
            type="text" 
            placeholder="Nombre" 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          <button 
            onClick={handleCreate}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center">Cargando...</td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-400">#{item.id}</td>
                <td className="px-6 py-4 font-bold">{item[nameField]}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800 font-bold px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
