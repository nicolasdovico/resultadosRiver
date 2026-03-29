'use client';

import { useSettings } from '@/context/SettingsContext';
import ClubShield from './ClubShield';

interface RiverShieldProps {
  className?: string;
}

export default function RiverOfficialShield({ className }: RiverShieldProps) {
  const { settings } = useSettings();
  
  // Usamos el fallback por si aún no cargó el contexto o no hay imagen configurada
  const FALLBACK = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Escudo_del_C_A_River_Plate.svg/1200px-Escudo_del_C_A_River_Plate.svg.png';
  
  return (
    <ClubShield 
      src={settings.river_shield || FALLBACK} 
      alt="River Plate" 
      className={className} 
    />
  );
}
