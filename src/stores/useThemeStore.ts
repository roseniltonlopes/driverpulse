import { create } from 'zustand';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, DARK_THEME, LIGHT_THEME } from '../constants/theme';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  isInitialized: boolean;
  initializeTheme: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const STORAGE_KEY = '@driverpulse_theme_mode';

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'dark', // Default to Dark matching the aesthetic inspiration
  isInitialized: false,

  initializeTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        set({ themeMode: stored, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },

  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (err) {
      console.error('Error saving theme mode:', err);
    }
  },

  toggleTheme: async () => {
    const current = get().themeMode;
    const nextMode: ThemeMode = current === 'dark' ? 'light' : 'dark';
    await get().setThemeMode(nextMode);
  },
}));

/**
 * Hook to consume active theme colors, current theme state, and toggle function
 */
export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useThemeStore(s => s.themeMode);
  const setThemeMode = useThemeStore(s => s.setThemeMode);
  const toggleTheme = useThemeStore(s => s.toggleTheme);

  const isDark = themeMode === 'system' ? systemScheme !== 'light' : themeMode === 'dark';
  const colors: ThemeColors = isDark ? DARK_THEME : LIGHT_THEME;

  return {
    colors,
    themeMode,
    isDark,
    setThemeMode,
    toggleTheme,
  };
}
