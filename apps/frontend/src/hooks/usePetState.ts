import { create } from 'zustand';
import type { Pet, PetState } from '@neogochi/shared';

interface PetStore {
  pet: Pet | null;
  isConnected: boolean;
  error: string | null;
  setPet: (pet: Pet) => void;
  clearPet: () => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePetState = create<PetStore>((set) => ({
  pet: null,
  isConnected: false,
  error: null,
  setPet: (pet) => set({ pet, error: null }),
  clearPet: () => set({ pet: null }),
  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ error }),
}));
