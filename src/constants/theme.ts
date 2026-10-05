export const COLORS = {
  // Base backgrounds
  background: '#0B0F19',
  card: '#151D30',
  cardElevated: '#1E293B',
  cardBorder: '#2A364F',
  
  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Accents
  primary: '#10B981', // Emerald - Profit / Primary
  primaryDark: '#059669',
  primaryLight: 'rgba(16, 185, 129, 0.15)',
  
  danger: '#EF4444', // Red - Expense / Alert
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  
  warning: '#F59E0B', // Amber - Fuel / Warning / Open Shift
  warningLight: 'rgba(245, 158, 11, 0.15)',
  
  info: '#3B82F6', // Blue - Metrics / Shift info
  infoLight: 'rgba(59, 130, 246, 0.15)',
  
  purple: '#8B5CF6',
  purpleLight: 'rgba(139, 92, 246, 0.15)',

  // Platform Colors
  platformUber: '#000000',
  platformUberBorder: '#38BDF8',
  platform99: '#F97316',
  platformInDrive: '#10B981',
  platformPrivate: '#8B5CF6',

  // Category Colors
  categoryFuel: '#F59E0B',
  categoryFood: '#EC4899',
  categoryMaintenance: '#6366F1',
  categoryOther: '#64748B',
};

export const PLATFORM_INFO: Record<string, { label: string; color: string; badgeBg: string; textColor: string }> = {
  UBER: {
    label: 'Uber',
    color: '#0284C7',
    badgeBg: 'rgba(2, 132, 199, 0.18)',
    textColor: '#38BDF8',
  },
  '99': {
    label: '99 App',
    color: '#F97316',
    badgeBg: 'rgba(249, 115, 22, 0.18)',
    textColor: '#FB923C',
  },
  INDRIVE: {
    label: 'inDrive',
    color: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    textColor: '#34D399',
  },
  PRIVATE: {
    label: 'Particular',
    color: '#A855F7',
    badgeBg: 'rgba(168, 85, 247, 0.18)',
    textColor: '#C084FC',
  },
};

export const EXPENSE_INFO: Record<string, { label: string; color: string; badgeBg: string; textColor: string }> = {
  FUEL: {
    label: 'Combustível',
    color: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    textColor: '#FBBF24',
  },
  FOOD: {
    label: 'Alimentação',
    color: '#EC4899',
    badgeBg: 'rgba(236, 72, 153, 0.18)',
    textColor: '#F472B6',
  },
  MAINTENANCE: {
    label: 'Manutenção / Óleo',
    color: '#6366F1',
    badgeBg: 'rgba(99, 102, 241, 0.18)',
    textColor: '#818CF8',
  },
  OTHER: {
    label: 'Outros Custos',
    color: '#64748B',
    badgeBg: 'rgba(100, 116, 139, 0.18)',
    textColor: '#94A3B8',
  },
};
