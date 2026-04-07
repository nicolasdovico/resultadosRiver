/**
 * Sanitiza la URL de la imagen para que funcione tanto en local como en producción.
 * Convierte cualquier URL de storage en una ruta relativa /storage/...
 * para que sea gestionada por el rewrite de Next.js hacia el contenedor backend.
 */
export function sanitizeImageUrl(url?: string | null): string {
  if (!url) return "";
  
  // Si la URL contiene /storage/, extraemos solo la parte del path relativo
  if (url.includes("/storage/")) {
    const parts = url.split("/storage/");
    const relativePath = parts[parts.length - 1];
    return `/storage/${relativePath}`;
  }
  
  // Si ya es una ruta relativa que empieza por /, la dejamos
  if (url.startsWith('/')) return url;
  
  return url;
}
