export function formatLocalDate(dateStr: string, options: Intl.DateTimeFormatOptions = {}): string {
  if (!dateStr) return '';
  
  // Parse YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('es-AR', options);
}

export interface DateDuration {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  formatted: string;
  isCurrent: boolean;
}

export function calculateDateDuration(startDateStr: string, endDateStr?: string | null): DateDuration | null {
  if (!startDateStr) return null;

  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);

  let end: Date;
  let isCurrent = false;
  if (endDateStr) {
    const [ey, em, ed] = endDateStr.split('-').map(Number);
    end = new Date(ey, em - 1, ed);
  } else {
    end = new Date();
    isCurrent = true;
  }

  if (end < start) return null;

  // Exact difference in days (inclusive: day 1 to day N)
  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  // Breakdown in years, months, days
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate() + 1;

  if (days <= 0) {
    months--;
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);

  let formatted = '';
  if (parts.length === 1) {
    formatted = parts[0];
  } else if (parts.length === 2) {
    formatted = `${parts[0]} y ${parts[1]}`;
  } else if (parts.length === 3) {
    formatted = `${parts[0]}, ${parts[1]} y ${parts[2]}`;
  }

  return {
    years,
    months,
    days,
    totalDays,
    formatted,
    isCurrent,
  };
}

export function calculateMultipleCyclesDuration(ciclos: Array<{ desde: string; hasta: string | null }>): {
  totalDays: number;
  formatted: string;
  years: number;
  months: number;
  days: number;
} | null {
  if (!ciclos || ciclos.length === 0) return null;

  let totalActiveDays = 0;
  for (const c of ciclos) {
    const dur = calculateDateDuration(c.desde, c.hasta);
    if (dur) {
      totalActiveDays += dur.totalDays;
    }
  }

  const years = Math.floor(totalActiveDays / 365.25);
  const remainingDaysAfterYears = totalActiveDays - (years * 365.25);
  const months = Math.floor(remainingDaysAfterYears / 30.4375);
  const days = Math.round(remainingDaysAfterYears - (months * 30.4375));

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);

  let formatted = '';
  if (parts.length === 1) {
    formatted = parts[0];
  } else if (parts.length === 2) {
    formatted = `${parts[0]} y ${parts[1]}`;
  } else if (parts.length === 3) {
    formatted = `${parts[0]}, ${parts[1]} y ${parts[2]}`;
  }

  return {
    totalDays: totalActiveDays,
    formatted,
    years,
    months,
    days,
  };
}
