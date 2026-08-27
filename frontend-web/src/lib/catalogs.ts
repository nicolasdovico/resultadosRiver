import { customInstance } from '@/api/custom-instance';

export interface Option {
  id: string | number;
  label: string;
}

export interface CatalogsData {
  rivales: Option[];
  torneos: Option[];
  niveles: string[];
  fases: Option[];
  estadios: Option[];
  arbitros: Option[];
  tecnicos: Option[];
}

let cachedCatalogs: CatalogsData | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function getCachedCatalogs(fetchOptions: any = {}): Promise<CatalogsData> {
  const now = Date.now();
  if (cachedCatalogs && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedCatalogs;
  }

  try {
    const [
      rivalesRes,
      torneosRes,
      nivelesRes,
      fasesRes,
      estadiosRes,
      arbitrosRes,
      tecnicosRes
    ] = await Promise.all([
      customInstance<{ data: any[] }>({ url: '/v1/rivales', method: 'GET', params: { limit: -1 }, ...fetchOptions }),
      customInstance<{ data: any[] }>({ url: '/v1/torneos', method: 'GET', params: { limit: -1 }, ...fetchOptions }),
      customInstance<string[]>({ url: '/v1/torneos/niveles', method: 'GET', ...fetchOptions }),
      customInstance<{ data: any[] }>({ url: '/v1/fases', method: 'GET', ...fetchOptions }),
      customInstance<{ data: any[] }>({ url: '/v1/estadios', method: 'GET', params: { limit: -1 }, ...fetchOptions }),
      customInstance<{ data: any[] }>({ url: '/v1/arbitros', method: 'GET', params: { limit: -1 }, ...fetchOptions }),
      customInstance<{ data: any[] }>({ url: '/v1/tecnicos', method: 'GET', params: { limit: -1 }, ...fetchOptions }),
    ]);

    cachedCatalogs = {
      rivales: (rivalesRes.data || []).map((r: any) => ({ id: r.ri_id, label: r.ri_desc })),
      torneos: (torneosRes.data || []).map((t: any) => ({ id: t.tor_id, label: t.tor_desc })),
      niveles: Array.isArray(nivelesRes) ? nivelesRes : [],
      fases: (fasesRes.data || []).map((f: any) => ({ id: f.id_fase, label: f.fa_desc })),
      estadios: (estadiosRes.data || []).map((e: any) => ({ id: e.es_id, label: e.es_desc })),
      arbitros: (arbitrosRes.data || []).map((a: any) => ({ id: a.ar_id, label: a.ar_apno || a.ar_desc })),
      tecnicos: (tecnicosRes.data || []).map((tc: any) => ({ id: tc.id_tecnicos, label: tc.tec_ape_nom || tc.te_desc })),
    };
    lastCacheTime = now;
    return cachedCatalogs;
  } catch (error) {
    console.error('Error fetching filter catalogs:', error);
    if (cachedCatalogs) return cachedCatalogs;
    return {
      rivales: [],
      torneos: [],
      niveles: [],
      fases: [],
      estadios: [],
      arbitros: [],
      tecnicos: [],
    };
  }
}
