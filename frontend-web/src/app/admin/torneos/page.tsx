'use client';

import CatalogManager from '@/components/CatalogManager';
import { getTorneos, createTorneo, deleteTorneo } from '@/api/generated/endpoints/torneos/torneos';

export default function AdminTorneos() {
  return (
    <CatalogManager 
      title="Torneos"
      fetchFn={getTorneos}
      createFn={createTorneo}
      deleteFn={deleteTorneo}
      nameField="tor_nombre"
    />
  );
}
