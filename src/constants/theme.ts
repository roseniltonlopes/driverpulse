export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  card: string;
  cardElevated: string;
  cardBorder: string;
  cardGlow: string;
  
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGradient: [string, string];
  
  danger: string;
  dangerLight: string;
  
  warning: string;
  warningLight: string;
  
  info: string;
  infoLight: string;

  tagBg: string;
  tagBorder: string;

  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const DARK_THEME: ThemeColors = {
  // Deep matte dark sage/black from the inspiration screenshot
  background: '#0D1311',
  backgroundSecondary: '#111815',
  card: '#16201C',
  cardElevated: '#1D2A24',
  cardBorder: '#273830',
  cardGlow: 'rgba(0, 229, 153, 0.12)',

  textPrimary: '#FFFFFF',
  textSecondary: '#9CB3A8',
  textMuted: '#63786F',

  // Radiant Mint / Emerald accent
  primary: '#00E599',
  primaryDark: '#059669',
  primaryLight: 'rgba(0, 229, 153, 0.14)',
  primaryGradient: ['#00E599', '#059669'],

  danger: '#F87171',
  dangerLight: 'rgba(248, 113, 113, 0.16)',

  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.16)',

  info: '#38BDF8',
  infoLight: 'rgba(56, 189, 248, 0.16)',

  tagBg: '#212E28',
  tagBorder: '#2D3F37',

  tabBarBg: '#111815',
  tabBarBorder: '#1F2B25',
  tabBarActive: '#00E599',
  tabBarInactive: '#63786F',
};

export const LIGHT_THEME: ThemeColors = {
  // Fresh, airy mint-tinted light theme
  background: '#F2F7F4',
  backgroundSecondary: '#E8F1EC',
  card: '#FFFFFF',
  cardElevated: '#F9FCFA',
  cardBorder: '#DCE8E2',
  cardGlow: 'rgba(5, 150, 105, 0.08)',

  textPrimary: '#111A16',
  textSecondary: '#4A5E55',
  textMuted: '#7D948B',

  // Rich Emerald for crisp contrast on light backgrounds
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: 'rgba(5, 150, 105, 0.12)',
  primaryGradient: ['#10B981', '#059669'],

  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.12)',

  warning: '#D97706',
  warningLight: 'rgba(217, 119, 6, 0.12)',

  info: '#0284C7',
  infoLight: 'rgba(2, 132, 199, 0.12)',

  tagBg: '#E7F2EC',
  tagBorder: '#D3E4DB',

  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E0EAE4',
  tabBarActive: '#059669',
  tabBarInactive: '#82978E',
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
    color: '#00E599',
    badgeBg: 'rgba(0, 229, 153, 0.18)',
    textColor: '#00E599',
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
    color: '#FBBF24',
    badgeBg: 'rgba(251, 191, 36, 0.18)',
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
    color: '#818CF8',
    badgeBg: 'rgba(129, 140, 248, 0.18)',
    textColor: '#818CF8',
  },
  OTHER: {
    label: 'Outros Custos',
    color: '#94A3B8',
    badgeBg: 'rgba(148, 163, 184, 0.18)',
    textColor: '#94A3B8',
  },
};

// Backward-compatible static COLORS export matching active Dark Theme
export const COLORS = DARK_THEME;
