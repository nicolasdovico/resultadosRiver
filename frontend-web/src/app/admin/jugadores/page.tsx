'use client';

import CatalogManager from '@/components/CatalogManager';
import { getJugadores, createJugador, deleteJugador } from '@/api/generated/endpoints/jugadores/jugadores';

export default function AdminJugadores() {
  return (
    <CatalogManager 
      title="Jugadores"
      fetchFn={getJugadores}
      createFn={createJugador}
      deleteFn={deleteJugador}
      nameField="pla_nombre"
    />
  );
}
