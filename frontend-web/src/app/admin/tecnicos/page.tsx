'use client';

import CatalogManager from '@/components/CatalogManager';
import { getTecnicos, createTecnico, deleteTecnico } from '@/api/generated/endpoints/tecnicos/tecnicos';

export default function AdminTecnicos() {
  return (
    <CatalogManager 
      title="Técnicos"
      fetchFn={getTecnicos}
      createFn={createTecnico}
      deleteFn={deleteTecnico}
      nameField="tec_nombre"
    />
  );
}
