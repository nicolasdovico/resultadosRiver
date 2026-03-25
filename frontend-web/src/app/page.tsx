'use client';

import { useEffect, useState } from "react";
import { getPartidos } from "@/api/generated/endpoints/partidos/partidos";
import Link from "next/link";
import { 
  Trophy, 
  Users, 
  UserRound, 
  ShieldAlert, 
  MapPin, 
  ChevronRight, 
  Star,
  Crown,
  LogOut,
  CircleArrowRight,
  TrendingUp,
  Search
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { formatLocalDate } from "@/utils/date";

interface Partido {
  fecha: string;
  rival?: {
    ri_desc: string;
  };
  torneo?: {
    tor_desc: string;
  };
  goles_river: number;
  goles_rival: number;
  resultado: string;
}

const CATEGORIES = [
  { id: 'partidos', label: 'Partidos', icon: Trophy, color: 'bg-red-50 text-red-600', desc: 'Historial completo de resultados.' },
  { id: 'jugadores', label: 'Jugadores', icon: Users, color: 'bg-zinc-50 text-zinc-600', desc: 'Goleadores y figuras históricas.' },
  { id: 'tecnicos', label: 'Técnicos', icon: UserRound, color: 'bg-slate-50 text-slate-600', desc: 'Ciclos exitosos y efectividad.' },
  { id: 'rivales', label: 'Rivales', icon: ShieldAlert, color: 'bg-zinc-50 text-zinc-500', desc: 'Historial contra cada adversario.' },
  { id: 'estadios', label: 'Estadios', icon: MapPin, color: 'bg-zinc-50 text-zinc-500', desc: 'Donde River fue local o visitante.' },
  { id: 'torneos', label: 'Torneos', icon: Star, color: 'bg-red-50 text-red-600', desc: 'Competiciones y títulos ganados.' },
];

export default function Home() {
  const { user, logout, isPremium, token } = useAuth();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [sectionTitle, setSectionTitle] = useState('Resultados Recientes');

  useEffect(() => {
    async function fetchData() {
      try {
        // @ts-expect-error - customInstance returns response body directly
        const res = await getPartidos({ limit: 6, hoy: true });
        
        // Ensure we are accessing the correct path in the response
        if (res && (res as any).data) {
          setPartidos((res as any).data);
        }
        
        if (res && (res as any).meta?.title) {
          setSectionTitle((res as any).meta.title);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header / Nav */}
      <nav className="bg-red-800 text-white py-4 px-6 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <Link href="/" className="text-2xl font-black italic tracking-tighter">
          RESULTADOS<span className="text-red-300">RIVER</span>
        </Link>
        <div className="flex items-center gap-6">
          {token ? (
            <>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold">{user?.name}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${isPremium ? 'bg-yellow-400 text-yellow-900' : 'bg-red-700 text-red-100'}`}>
                  {isPremium ? '👑 Premium' : 'Free'}
                </span>
              </div>
              <button onClick={logout} className="p-2 hover:bg-red-700 rounded-full transition-colors" title="Cerrar Sesión">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="bg-white text-red-800 px-4 py-2 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-800 to-red-950 text-white pt-16 pb-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
          <ShieldAlert size={400} />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight max-w-4xl uppercase">
              La Historia del <br/><span className="text-zinc-100 italic">Más Grande</span> en Datos
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mb-10 font-medium">
              Explora décadas de gloria. Estadísticas, resultados y figuras que hicieron historia en el Club Atlético River Plate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {!token ? (
                <Link href="/auth/register" className="bg-white text-red-700 px-8 py-4 rounded-2xl font-black text-lg hover:bg-zinc-50 transition-all flex items-center shadow-xl shadow-red-950/20">
                  Registrate Gratis
                  <ChevronRight className="ml-2" />
                </Link>
              ) : !isPremium ? (
                <Link href="/premium" className="bg-yellow-400 text-yellow-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-yellow-300 transition-all flex items-center shadow-xl shadow-yellow-900/20">
                  <Crown className="mr-2" />
                  Hacerme Premium
                  <ChevronRight className="ml-2" />
                </Link>
              ) : null}
              <Link href="/partidos" className="bg-red-600/30 backdrop-blur-md border border-red-500/30 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-red-600/40 transition-all">
                Explorar Archivo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-4 bg-zinc-50 -mt-10 rounded-t-[40px] relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col mb-12">
            <h2 className="text-3xl font-black text-zinc-900 mb-2">¿Qué estás buscando?</h2>
            <p className="text-zinc-500 font-medium">Selecciona un criterio para ver toda la información.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/${cat.id}`}
                className="bg-white p-8 rounded-[32px] border border-zinc-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all group"
              >
                <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-zinc-900 mb-2">{cat.label}</h3>
                <p className="text-zinc-500 text-sm font-medium mb-6">{cat.desc}</p>
                <div className="flex items-center text-zinc-400 font-bold text-xs uppercase tracking-wider group-hover:text-red-600 transition-colors">
                  Explorar <ChevronRight size={14} className="ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Teaser Data Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-zinc-900 mb-2">{sectionTitle}</h2>
              <p className="text-zinc-500 font-medium">Registrate para acceder al detalle de cada encuentro.</p>
            </div>
            <Link href="/partidos" className="text-red-600 font-black text-sm hover:underline flex items-center">
              Ver Historial Completo <CircleArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {partidos.map((partido, index) => (
              <Link 
                key={index} 
                href={`/partidos/${partido.fecha}`}
                className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 flex items-center shadow-sm hover:border-red-100 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[10px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full font-bold uppercase">{formatLocalDate(partido.fecha)}</span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">{partido.torneo?.tor_desc || 'Torneo'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-black text-lg text-zinc-800 tracking-tight">River Plate</span>
                      <span className="text-sm text-zinc-500 font-medium">{partido.rival?.ri_desc || 'Rival'}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-3xl font-black ${partido.resultado === 'G' ? 'text-green-600' : partido.resultado === 'P' ? 'text-red-600' : 'text-zinc-400'}`}>
                        {partido.goles_river} - {partido.goles_rival}
                      </span>
                      <ChevronRight className="text-zinc-300 group-hover:text-red-400 transition-colors" size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Registration Hook (only for guests) */}
          {!token && (
            <div className="mt-12 bg-zinc-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute bottom-0 right-0 opacity-10 -mb-20 -mr-20">
                <TrendingUp size={400} />
              </div>
              <div className="relative z-10 max-w-2xl">
                <h3 className="text-3xl md:text-4xl font-black mb-4">¿Querés más datos?</h3>
                <p className="text-zinc-400 text-lg font-medium mb-8">
                  Registrate para acceder al historial completo, buscadores avanzados y perfiles de jugadores históricos. Es totalmente gratis.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/auth/register" className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 transition-colors">
                    Crear Mi Cuenta
                  </Link>
                  <Link href="/premium" className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black hover:bg-white/20 transition-colors border border-white/10 flex items-center">
                    <Star className="mr-2 fill-yellow-400 text-yellow-400" size={18} />
                    Ver Beneficios Premium
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Search Teaser */}
      <section className="pb-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-zinc-100 rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-zinc-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg text-red-600 shrink-0">
              <Search size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Buscador Histórico</h3>
              <p className="text-zinc-500 font-medium">
                Encuentra cualquier partido, gol o jugador en nuestra base de datos que abarca décadas de historia millonaria.
              </p>
            </div>
            <Link href={token ? "/partidos" : "/auth/login"} className="bg-white text-zinc-900 px-8 py-4 rounded-2xl font-black hover:shadow-xl transition-all shadow-sm shrink-0">
              {token ? "Probar Buscador" : "Inicia Sesión"}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-200 py-12 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-black tracking-tight text-zinc-900 uppercase">
            Resultados <span className="text-red-600">River Plate</span>
          </div>
          <p className="text-zinc-400 text-sm font-medium">
            © {new Date().getFullYear()} - Hecho para el hincha millonario.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-zinc-400 hover:text-red-600 text-sm font-medium transition-colors">Aviso Legal</Link>
            <Link href="#" className="text-zinc-400 hover:text-red-600 text-sm font-medium transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
