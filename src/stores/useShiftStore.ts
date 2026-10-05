import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shift } from '../types/database.types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './useAuthStore';

interface ShiftState {
  activeShift: Shift | null;
  shifts: Shift[];
  isLoading: boolean;
  loadShifts: () => Promise<void>;
  startShift: (startKm: number) => Promise<{ shift: Shift | null; error: string | null }>;
  endShift: (endKm: number) => Promise<{ shift: Shift | null; error: string | null }>;
  cancelActiveShift: () => Promise<void>;
  deleteShift: (shiftId: string) => Promise<void>;
  seedDemoShifts: () => Promise<void>;
}

const STORAGE_KEYS = {
  ACTIVE_SHIFT: '@driverpulse_active_shift',
  SHIFTS_HISTORY: '@driverpulse_shifts_history',
};

export const useShiftStore = create<ShiftState>((set, get) => ({
  activeShift: null,
  shifts: [],
  isLoading: false,

  loadShifts: async () => {
    try {
      set({ isLoading: true });
      const user = useAuthStore.getState().user;
      const isGuest = useAuthStore.getState().isGuest;

      // Load from local storage first
      const storedActive = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFT);
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEYS.SHIFTS_HISTORY);

      const localActive: Shift | null = storedActive ? JSON.parse(storedActive) : null;
      let localHistory: Shift[] = storedHistory ? JSON.parse(storedHistory) : [];

      set({
        activeShift: localActive,
        shifts: localHistory,
      });

      // If Supabase is connected and not in guest mode, fetch from cloud
      if (isSupabaseConfigured() && !isGuest && user) {
        const { data, error } = await supabase
          .from('shifts')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });

        if (!error && data) {
          const fetchedShifts = data as Shift[];
          const cloudActive = fetchedShifts.find(s => s.status === 'OPEN') || null;
          set({
            activeShift: cloudActive,
            shifts: fetchedShifts,
          });
          await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFT, JSON.stringify(cloudActive));
          await AsyncStorage.setItem(STORAGE_KEYS.SHIFTS_HISTORY, JSON.stringify(fetchedShifts));
        }
      }
    } catch (err) {
      console.error('Error loading shifts:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  startShift: async (startKm: number) => {
    try {
      if (get().activeShift) {
        return { shift: null, error: 'Já existe um turno aberto em andamento!' };
      }

      if (startKm <= 0 || isNaN(startKm)) {
        return { shift: null, error: 'Informe um hodômetro inicial válido.' };
      }

      const user = useAuthStore.getState().user;
      const userId = user?.id || 'guest-user-123';
      const isGuest = useAuthStore.getState().isGuest;

      const newShift: Shift = {
        id: `shift-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        start_time: new Date().toISOString(),
        end_time: null,
        start_km: Math.round(startKm),
        end_km: null,
        status: 'OPEN',
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured() && !isGuest) {
        const { data, error } = await supabase
          .from('shifts')
          .insert({
            user_id: userId,
            start_time: newShift.start_time,
            start_km: newShift.start_km,
            status: 'OPEN',
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase start shift error:', error);
          // Fallback to local
        } else if (data) {
          newShift.id = data.id;
        }
      }

      const updatedHistory = [newShift, ...get().shifts];
      set({ activeShift: newShift, shifts: updatedHistory });

      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFT, JSON.stringify(newShift));
      await AsyncStorage.setItem(STORAGE_KEYS.SHIFTS_HISTORY, JSON.stringify(updatedHistory));

      return { shift: newShift, error: null };
    } catch (e: any) {
      return { shift: null, error: e.message || 'Erro ao iniciar turno' };
    }
  },

  endShift: async (endKm: number) => {
    try {
      const active = get().activeShift;
      if (!active) {
        return { shift: null, error: 'Nenhum turno aberto para finalizar.' };
      }

      if (endKm < active.start_km) {
        return {
          shift: null,
          error: `O hodômetro final (${endKm} km) não pode ser menor que o inicial (${active.start_km} km).`,
        };
      }

      const endTime = new Date().toISOString();
      const closedShift: Shift = {
        ...active,
        end_time: endTime,
        end_km: Math.round(endKm),
        status: 'CLOSED',
      };

      const isGuest = useAuthStore.getState().isGuest;

      if (isSupabaseConfigured() && !isGuest) {
        await supabase
          .from('shifts')
          .update({
            end_time: closedShift.end_time,
            end_km: closedShift.end_km,
            status: 'CLOSED',
          })
          .eq('id', active.id);
      }

      const updatedHistory = get().shifts.map(s => (s.id === active.id ? closedShift : s));
      set({ activeShift: null, shifts: updatedHistory });

      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SHIFT);
      await AsyncStorage.setItem(STORAGE_KEYS.SHIFTS_HISTORY, JSON.stringify(updatedHistory));

      return { shift: closedShift, error: null };
    } catch (e: any) {
      return { shift: null, error: e.message || 'Erro ao encerrar turno' };
    }
  },

  cancelActiveShift: async () => {
    const active = get().activeShift;
    if (!active) return;

    const isGuest = useAuthStore.getState().isGuest;
    if (isSupabaseConfigured() && !isGuest) {
      await supabase.from('shifts').delete().eq('id', active.id);
    }

    const updatedHistory = get().shifts.filter(s => s.id !== active.id);
    set({ activeShift: null, shifts: updatedHistory });

    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SHIFT);
    await AsyncStorage.setItem(STORAGE_KEYS.SHIFTS_HISTORY, JSON.stringify(updatedHistory));
  },

  deleteShift: async (shiftId: string) => {
    const isGuest = useAuthStore.getState().isGuest;
    if (isSupabaseConfigured() && !isGuest) {
      await supabase.from('shifts').delete().eq('id', shiftId);
    }

    const updated = get().shifts.filter(s => s.id !== shiftId);
    set({
      shifts: updated,
      activeShift: get().activeShift?.id === shiftId ? null : get().activeShift,
    });
    await AsyncStorage.setItem(STORAGE_KEYS.SHIFTS_HISTORY, JSON.stringify(updated));
  },

  seedDemoShifts: async () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'guest-user-123';
    const now = new Date();

    const sampleShifts: Shift[] = [
      {
        id: `shift-demo-1`,
        user_id: userId,
        start_time: new Date(now.getTime() - 28 * 3600 * 1000).toISOString(),
        end_time: new Date(now.getTime() - 20 * 3600 * 1000).toISOString(),
        start_km: 45200,
        end_km: 45385, // 185 km rodados
        status: 'CLOSED',
        created_at: new Date(now.getTime() - 28 * 3600 * 1000).toISOString(),
      },
      {
        id: `shift-demo-2`,
        user_id: userId,
        start_time: new Date(now.getTime() - 52 * 3600 * 1000).toISOString(),
        end_time: new Date(now.getTime() - 44 * 3600 * 1000).toISOString(),
        start_km: 45010,
        end_km: 45200, // 190 km rodados
        status: 'CLOSED',
        created_at: new Date(now.getTime() - 52 * 3600 * 1000).toISOString(),
      },
    ];

    set({ shifts: sampleShifts });
    await AsyncStorage.setItem(STORAGE_KEYS.SHIFTS_HISTORY, JSON.stringify(sampleShifts));
  },
}));
