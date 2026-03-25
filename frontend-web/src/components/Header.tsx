'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Trophy, Users, UserRound, ShieldAlert, MapPin, Star, LogOut, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ScaleIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, token, logout, isPremium } = useAuth();

  const navLinks = [
    { href: "/partidos", label: "Partidos", icon: Trophy },
    { href: "/torneos", label: "Torneos", icon: Star },
    { href: "/jugadores", label: "Jugadores", icon: Users },
    { href: "/tecnicos", label: "Técnicos", icon: UserRound },
    { href: "/rivales", label: "Rivales", icon: ShieldAlert },
    { href: "/estadios", label: "Estadios", icon: MapPin },
    { href: "/arbitros", label: "Árbitros", icon: ScaleIcon },
  ];

  return (
    <>
      <header className="bg-red-700 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-red-700 font-black text-xl italic">R</span>
            </div>
            <span className="font-black text-lg tracking-tighter hidden sm:inline uppercase italic">
              Resultados<span className="text-red-200">River</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-black uppercase tracking-widest">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-red-200 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {!token ? (
              <Link href="/auth/login" className="bg-white text-red-700 px-5 py-2 rounded-2xl font-black text-xs uppercase hover:bg-red-50 transition-colors hidden sm:block">
                Iniciar Sesión
              </Link>
            ) : !isPremium ? (
              <Link href="/premium" className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-2xl font-black text-xs uppercase hover:bg-yellow-300 transition-colors hidden sm:block">
                Ser Premium
              </Link>
            ) : null}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 hover:bg-red-600 rounded-xl transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="lg:hidden bg-red-800 border-t border-red-600 py-6 px-4 space-y-2 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-4 bg-red-700/50 rounded-2xl hover:bg-red-600 transition-colors"
                >
                  <link.icon size={18} className="text-red-200" />
                  <span className="font-bold text-sm">{link.label}</span>
                </Link>
              ))}
            </div>
            {!token ? (
              <Link 
                href="/auth/login" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full bg-white text-red-700 p-4 rounded-2xl font-black text-sm uppercase mt-4"
              >
                Iniciar Sesión
              </Link>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between p-4 bg-red-900/50 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{user?.name}</span>
                    <span className={`text-[10px] font-black uppercase ${isPremium ? 'text-yellow-400' : 'text-red-300'}`}>
                      {isPremium ? '👑 Premium' : 'Free'}
                    </span>
                  </div>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="p-2 bg-red-700 rounded-xl hover:bg-red-600 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
      
      {/* User Bar (Visible when logged in) */}
      {token && (
        <div className="bg-zinc-900 text-white py-2 px-4 shadow-inner border-b border-zinc-800">
          <div className="container mx-auto flex justify-between items-center max-w-6xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                <Users size={16} className="text-zinc-400" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-sm font-bold tracking-tight">{user?.name}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase w-fit ${isPremium ? 'bg-yellow-400 text-yellow-950' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isPremium ? '👑 Premium' : 'Free Account'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!isPremium && (
                <Link href="/premium" className="text-[10px] font-black uppercase text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1 sm:mr-2">
                  <Crown size={12} />
                  Mejorar Plan
                </Link>
              )}
              <button 
                onClick={logout} 
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold"
              >
                <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Cerrar Sesión</span>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
