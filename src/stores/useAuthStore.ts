import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '../types/database.types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthState {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  isGuest: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  continueAsGuest: () => void;
}

const DEFAULT_PROFILE: Profile = {
  id: 'guest-user-123',
  name: 'Motorista Pro',
  daily_goal: 250.00,
  vehicle_model: 'Chevrolet Onix 1.0',
  maintenance_cost_per_km: 0.20,
  created_at: new Date().toISOString(),
};

const STORAGE_KEYS = {
  PROFILE: '@driverpulse_profile',
  GUEST_MODE: '@driverpulse_guest_mode',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isGuest: false,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Check if configured with Supabase
      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          set({ user: { id: session.user.id, email: session.user.email }, isGuest: false });
          
          // Fetch profile from supabase
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            set({ profile: profileData as Profile });
            await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
          }
          set({ isLoading: false });
          return;
        }
      }

      // Check local stored profile or guest mode
      const storedGuest = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_MODE);
      const storedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);

      if (storedGuest === 'true' || storedProfile) {
        const profile = storedProfile ? JSON.parse(storedProfile) : DEFAULT_PROFILE;
        set({
          user: { id: profile.id, email: 'motorista@driverpulse.app' },
          profile,
          isGuest: true,
          isLoading: false,
        });
        return;
      }

      // Default initial state: set guest mode by default for zero friction onboarding
      set({
        user: { id: DEFAULT_PROFILE.id, email: 'demo@driverpulse.app' },
        profile: DEFAULT_PROFILE,
        isGuest: true,
        isLoading: false,
      });
      await AsyncStorage.setItem(STORAGE_KEYS.GUEST_MODE, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    } catch (err) {
      console.error('Error initializing auth:', err);
      set({ profile: DEFAULT_PROFILE, isGuest: true, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured()) {
        // Mock sign in for offline/dev mode
        const profile: Profile = {
          ...DEFAULT_PROFILE,
          name: email.split('@')[0] || 'Motorista',
        };
        set({
          user: { id: profile.id, email },
          profile,
          isGuest: true,
        });
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        return { error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      if (data.user) {
        set({ user: { id: data.user.id, email: data.user.email }, isGuest: false });
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData) {
          set({ profile: profileData as Profile });
          await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
        }
      }
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Erro ao realizar login' };
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      if (!isSupabaseConfigured()) {
        const profile: Profile = {
          ...DEFAULT_PROFILE,
          id: `user-${Date.now()}`,
          name,
        };
        set({
          user: { id: profile.id, email },
          profile,
          isGuest: true,
        });
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        return { error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) return { error: error.message };

      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          name,
          daily_goal: 250.00,
          vehicle_model: 'Carro Padrão',
          maintenance_cost_per_km: 0.20,
          created_at: new Date().toISOString(),
        };
        set({ user: { id: data.user.id, email: data.user.email }, profile: newProfile, isGuest: false });
      }
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Erro ao criar conta' };
    }
  },

  signOut: async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.GUEST_MODE);
      await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE);
      set({ user: null, profile: null, isGuest: false });
    } catch (err) {
      console.error('SignOut error:', err);
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const current = get().profile;
      if (!current) return { error: 'Nenhum perfil encontrado' };

      const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
      set({ profile: updated });
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));

      if (isSupabaseConfigured() && !get().isGuest) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', current.id);

        if (error) return { error: error.message };
      }
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Erro ao atualizar perfil' };
    }
  },

  continueAsGuest: () => {
    set({
      user: { id: DEFAULT_PROFILE.id, email: 'demo@driverpulse.app' },
      profile: DEFAULT_PROFILE,
      isGuest: true,
    });
    AsyncStorage.setItem(STORAGE_KEYS.GUEST_MODE, 'true');
    AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  },
}));
