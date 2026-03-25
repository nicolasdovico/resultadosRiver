export function formatLocalDate(dateStr: string, options: Intl.DateTimeFormatOptions = {}): string {
  if (!dateStr) return '';
  
  // Parse YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('es-AR', options);
}
