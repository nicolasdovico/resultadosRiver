'use client';

import CatalogManager from '@/components/CatalogManager';
import { getRivales, createRival, deleteRival } from '@/api/generated/endpoints/rivales/rivales';

export default function AdminRivales() {
  return (
    <CatalogManager 
      title="Rivales"
      fetchFn={getRivales}
      createFn={createRival}
      deleteFn={deleteRival}
      nameField="riv_nombre"
    />
  );
}
