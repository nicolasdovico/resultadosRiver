'use client';

import CatalogManager from '@/components/CatalogManager';
import { getArbitros, createArbitro, deleteArbitro } from '@/api/generated/endpoints/arbitros/arbitros';

export default function AdminArbitros() {
  return (
    <CatalogManager 
      title="Árbitros"
      fetchFn={getArbitros}
      createFn={createArbitro}
      deleteFn={deleteArbitro}
      nameField="arb_nombre"
    />
  );
}
