'use client';

import { useState, useEffect } from 'react';
import { getUsers, updateUser } from '@/api/generated/endpoints/user-management/user-management';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      // @ts-expect-error - Resource structure
      setUsers(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async (user: any) => {
    const isPremium = user.roles.some((r: any) => r.name === 'Premium');
    const newRoles = isPremium ? ['Free'] : ['Premium', 'Free'];
    
    try {
      await updateUser(user.id, { roles: newRoles });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Administración de Usuarios</h1>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Roles</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center">Cargando usuarios...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold">{user.name}</td>
                <td className="px-6 py-4 text-slate-500">{user.email}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {user.roles.map((role: any) => (
                      <span key={role.id} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${role.name === 'Premium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => togglePremium(user)}
                    className={`font-bold px-4 py-1.5 rounded-xl text-xs transition-all ${user.roles.some((r: any) => r.name === 'Premium') ? 'bg-slate-100 text-slate-600' : 'bg-red-600 text-white shadow-md shadow-red-100'}`}
                  >
                    {user.roles.some((r: any) => r.name === 'Premium') ? 'Quitar Premium' : 'Hacer Premium'}
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
