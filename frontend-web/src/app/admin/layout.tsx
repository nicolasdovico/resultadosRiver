import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-xs text-slate-400 mt-1">Resultados River Plate</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Dashboard</Link>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Catálogos</div>
          <Link href="/admin/jugadores" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Jugadores</Link>
          <Link href="/admin/torneos" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Torneos</Link>
          <Link href="/admin/rivales" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Rivales</Link>
          <Link href="/admin/arbitros" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Árbitros</Link>
          <Link href="/admin/estadios" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Estadios</Link>
          <Link href="/admin/tecnicos" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Técnicos</Link>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Gestión</div>
          <Link href="/admin/partidos" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-bold text-red-400">Cargar Partido</Link>
          <Link href="/admin/users" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Usuarios</Link>
          <Link href="/admin/settings" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Configuración</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="block px-4 py-2 rounded-lg bg-slate-800 text-center text-sm font-medium">Volver a la Web</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
