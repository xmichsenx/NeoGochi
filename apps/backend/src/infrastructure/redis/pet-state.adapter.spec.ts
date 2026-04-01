import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisPetStateAdapter } from './pet-state.adapter';
import { Pet } from '../../domain/pet.entity';
import { ConfigService } from '@nestjs/config';

// Mock ioredis
vi.mock('ioredis', () => {
  const store = new Map<string, string>();
  const MockRedis = vi.fn(() => ({
    set: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve('OK');
    }),
    get: vi.fn((key: string) => {
      return Promise.resolve(store.get(key) ?? null);
    }),
    del: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve(1);
    }),
    quit: vi.fn().mockResolvedValue(undefined),
    _store: store,
  }));
  return { default: MockRedis };
});

describe('RedisPetStateAdapter', () => {
  let adapter: RedisPetStateAdapter;
  let configService: ConfigService;

  beforeEach(() => {
    // Clear mock store
    vi.clearAllMocks();

    configService = {
      get: vi.fn((key: string, defaultValue: unknown) => defaultValue),
    } as unknown as ConfigService;

    adapter = new RedisPetStateAdapter(configService);
  });

  it('should save and retrieve a pet', async () => {
    const pet = Pet.create('pet-1', 'TestPet', 'Chill');

    await adapter.save(pet);
    const retrieved = await adapter.findBySessionId('pet-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('TestPet');
    expect(retrieved!.startingClass).toBe('Chill');
    expect(retrieved!.currentState).toBe('Idle');
  });

  it('should return null for non-existent pet', async () => {
    const result = await adapter.findBySessionId('nonexistent');
    expect(result).toBeNull();
  });

  it('should delete a pet', async () => {
    const pet = Pet.create('pet-del', 'DeleteMe', 'Aggressive');

    await adapter.save(pet);
    await adapter.delete('pet-del');

    const result = await adapter.findBySessionId('pet-del');
    expect(result).toBeNull();
  });

  it('should preserve full pet data through serialization round-trip', async () => {
    const pet = Pet.create('pet-rt', 'RoundTrip', 'Intellectual');
    pet.feed(); // Modify some state

    await adapter.save(pet);
    const retrieved = await adapter.findBySessionId('pet-rt');

    expect(retrieved!.id).toBe(pet.id);
    expect(retrieved!.name).toBe(pet.name);
    expect(retrieved!.startingClass).toBe(pet.startingClass);
    expect(retrieved!.stats.hunger).toBe(pet.stats.hunger);
    expect(retrieved!.xp).toBe(pet.xp);
    expect(retrieved!.level).toBe(pet.level);
  });
});
