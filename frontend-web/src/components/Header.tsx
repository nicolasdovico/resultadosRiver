'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Trophy, Users, UserRound, ShieldAlert, MapPin, Star, Scale } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/partidos", label: "Partidos", icon: Trophy },
    { href: "/torneos", label: "Torneos", icon: Star },
    { href: "/jugadores", label: "Jugadores", icon: Users },
    { href: "/tecnicos", label: "Técnicos", icon: UserRound },
    { href: "/rivales", label: "Rivales", icon: ShieldAlert },
    { href: "/estadios", label: "Estadios", icon: MapPin },
    { href: "/arbitros", label: "Árbitros", icon: Scale },
  ];

  return (
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
          {navLinks.slice(0, 4).map(link => (
            <Link key={link.href} href={link.href} className="hover:text-red-200 transition-colors">
              {link.label}
            </Link>
          ))}
          <div className="h-4 w-px bg-red-600 mx-2" />
          {navLinks.slice(4).map(link => (
            <Link key={link.href} href={link.href} className="text-[10px] opacity-80 hover:opacity-100 hover:text-red-200 transition-all">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/login" className="bg-white text-red-700 px-5 py-2 rounded-2xl font-black text-xs uppercase hover:bg-red-50 transition-colors hidden sm:block">
            Premium
          </Link>
          
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
          <Link 
            href="/login" 
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-full bg-white text-red-700 p-4 rounded-2xl font-black text-sm uppercase mt-4"
          >
            Suscribirme a Premium
          </Link>
        </div>
      )}
    </header>
  );
}
