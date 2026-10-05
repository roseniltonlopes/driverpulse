/**
 * Formatters for Currency, Distance, Time and Dates in pt-BR
 */

export const formatBRL = (value: number | null | undefined): string => {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatKm = (value: number | null | undefined): string => {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return `${num.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
};

export const formatKmPerLiter = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value) || value <= 0) {
    return '-- km/l';
  }
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km/l`;
};

export const formatDurationFromMinutes = (minutes: number): string => {
  const mins = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours === 0) {
    return `${remainingMins} min`;
  }
  return `${hours}h ${remainingMins.toString().padStart(2, '0')}m`;
};

export const formatDurationFromSeconds = (seconds: number): string => {
  const secs = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const remainingSecs = secs % 60;

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
};

export const formatDateTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const formatTimeOnly = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
};

export const formatDateOnly = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};
