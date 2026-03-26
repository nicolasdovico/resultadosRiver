export const formatLocalDate = (dateString: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) => {
  try {
    if (!dateString) return '';
    
    // Backend returns YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    // Create date in local time
    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime())) return dateString;
    
    return new Intl.DateTimeFormat('es-AR', options).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
};
