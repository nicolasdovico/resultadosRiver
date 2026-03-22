import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-red-700 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Resultados <span className="text-zinc-100">River Plate</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/partidos" className="hover:text-red-200 transition-colors font-medium">
            Partidos
          </Link>
          <Link href="/torneos" className="hover:text-red-200 transition-colors font-medium">
            Torneos
          </Link>
          <Link href="/jugadores" className="hover:text-red-200 transition-colors font-medium">
            Jugadores
          </Link>
          <Link href="/login" className="bg-white text-red-700 px-4 py-1.5 rounded-full font-semibold text-sm hover:bg-red-50 transition-colors">
            Premium
          </Link>
        </nav>
      </div>
    </header>
  );
}
