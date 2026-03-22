'use client';

import CatalogManager from '@/components/CatalogManager';
import { getEstadios, createEstadio, deleteEstadio } from '@/api/generated/endpoints/estadios/estadios';

export default function AdminEstadios() {
  return (
    <CatalogManager 
      title="Estadios"
      fetchFn={getEstadios}
      createFn={createEstadio}
      deleteFn={deleteEstadio}
      nameField="est_nombre"
    />
  );
}
