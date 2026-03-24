import React from 'react';
import Link from 'next/link';
import { Lock, Star, ChevronRight } from 'lucide-react';

interface AccessControlProps {
  tier: 'guest' | 'registered' | 'premium';
  requiredTier: 'registered' | 'premium';
  children: React.ReactNode;
  className?: string;
}

export default function AccessControl({ tier, requiredTier, children, className = "" }: AccessControlProps) {
  // Determine if the user has sufficient access
  const hasAccess = 
    (requiredTier === 'registered' && (tier === 'registered' || tier === 'premium')) ||
    (requiredTier === 'premium' && tier === 'premium');

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // If no access, show the blurred version with a call to action
  return (
    <div className={`relative group ${className}`}>
      {/* Blurred Content Overlay */}
      <div className="select-none pointer-events-none blur-[6px] opacity-40 transition-all">
        {children}
      </div>

      {/* Action Card */}
      <div className="absolute inset-0 flex items-center justify-center p-6 z-30">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[32px] shadow-2xl border border-zinc-100 text-center max-w-sm transform transition-transform group-hover:scale-105">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${requiredTier === 'premium' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
            {requiredTier === 'premium' ? <Star className="fill-yellow-600" size={28} /> : <Lock size={28} />}
          </div>
          
          <h3 className="text-xl font-black text-zinc-900 mb-2 leading-tight">
            {requiredTier === 'premium' ? 'Contenido Premium' : 'Contenido Protegido'}
          </h3>
          
          <p className="text-zinc-500 text-sm font-medium mb-8">
            {requiredTier === 'premium' 
              ? 'Desbloquea estadísticas avanzadas y gráficos interactivos con una suscripción.' 
              : 'Registrate gratis para acceder a esta información completa.'}
          </p>

          <Link 
            href={requiredTier === 'premium' ? '/premium' : '/register'}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center transition-all ${
              requiredTier === 'premium' 
                ? 'bg-zinc-900 text-white hover:bg-black' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {requiredTier === 'premium' ? 'Hacerme Premium' : 'Crear Cuenta Gratis'}
            <ChevronRight className="ml-2" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
