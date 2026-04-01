import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePetState } from './usePetState';
import type { Pet } from '@neogochi/shared';

describe('usePetState', () => {
  beforeEach(() => {
    // Reset store between tests
    usePetState.setState({ pet: null, isConnected: false, error: null });
  });

  it('should start with null pet', () => {
    const state = usePetState.getState();
    expect(state.pet).toBeNull();
    expect(state.isConnected).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should setPet and clear error', () => {
    const mockPet: Pet = {
      id: 'pet-1',
      name: 'Buddy',
      startingClass: 'Chill',
      stats: { hunger: 80, happiness: 80, energy: 70, health: 90, cleanliness: 85 },
      currentState: 'Idle',
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
    };

    usePetState.getState().setError('some error');
    usePetState.getState().setPet(mockPet);

    const state = usePetState.getState();
    expect(state.pet).toEqual(mockPet);
    expect(state.error).toBeNull();
  });

  it('should clearPet', () => {
    usePetState.getState().setPet({
      id: 'pet-1',
      name: 'Buddy',
      startingClass: 'Chill',
      stats: { hunger: 80, happiness: 80, energy: 70, health: 90, cleanliness: 85 },
      currentState: 'Idle',
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
    });

    usePetState.getState().clearPet();
    expect(usePetState.getState().pet).toBeNull();
  });

  it('should setConnected', () => {
    usePetState.getState().setConnected(true);
    expect(usePetState.getState().isConnected).toBe(true);

    usePetState.getState().setConnected(false);
    expect(usePetState.getState().isConnected).toBe(false);
  });

  it('should setError', () => {
    usePetState.getState().setError('Connection lost');
    expect(usePetState.getState().error).toBe('Connection lost');

    usePetState.getState().setError(null);
    expect(usePetState.getState().error).toBeNull();
  });
});
