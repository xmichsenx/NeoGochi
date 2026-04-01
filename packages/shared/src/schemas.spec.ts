import { describe, it, expect } from 'vitest';
import {
  PetStatsSchema,
  PetSchema,
  CreatePetDtoSchema,
  PetStateEnum,
  StartingClassEnum,
  CLASS_CONFIGS,
} from './schemas';

describe('PetStatsSchema', () => {
  it('should validate correct stats', () => {
    const stats = { hunger: 50, happiness: 50, energy: 50, health: 50, cleanliness: 50 };
    expect(PetStatsSchema.parse(stats)).toEqual(stats);
  });

  it('should reject stats below 0', () => {
    const stats = { hunger: -1, happiness: 50, energy: 50, health: 50, cleanliness: 50 };
    expect(() => PetStatsSchema.parse(stats)).toThrow();
  });

  it('should reject stats above 100', () => {
    const stats = { hunger: 101, happiness: 50, energy: 50, health: 50, cleanliness: 50 };
    expect(() => PetStatsSchema.parse(stats)).toThrow();
  });
});

describe('CreatePetDtoSchema', () => {
  it('should validate a valid create pet DTO', () => {
    const dto = { name: 'Buddy', startingClass: 'Chill' as const };
    expect(CreatePetDtoSchema.parse(dto)).toEqual(dto);
  });

  it('should reject empty name', () => {
    expect(() => CreatePetDtoSchema.parse({ name: '', startingClass: 'Chill' })).toThrow();
  });

  it('should reject invalid starting class', () => {
    expect(() => CreatePetDtoSchema.parse({ name: 'Buddy', startingClass: 'Unknown' })).toThrow();
  });
});

describe('PetStateEnum', () => {
  it('should accept all valid states', () => {
    const states = ['Idle', 'Eating', 'Playing', 'Sleeping', 'Sick', 'Evolution', 'Dead'];
    for (const state of states) {
      expect(PetStateEnum.parse(state)).toBe(state);
    }
  });

  it('should reject invalid state', () => {
    expect(() => PetStateEnum.parse('Dancing')).toThrow();
  });
});

describe('StartingClassEnum', () => {
  it('should accept all valid classes', () => {
    const classes = ['Aggressive', 'Chill', 'Intellectual'];
    for (const cls of classes) {
      expect(StartingClassEnum.parse(cls)).toBe(cls);
    }
  });
});

describe('CLASS_CONFIGS', () => {
  it('should have configs for all starting classes', () => {
    expect(CLASS_CONFIGS.Aggressive).toBeDefined();
    expect(CLASS_CONFIGS.Chill).toBeDefined();
    expect(CLASS_CONFIGS.Intellectual).toBeDefined();
  });

  it('should have valid initial stats for each class', () => {
    for (const config of Object.values(CLASS_CONFIGS)) {
      expect(() => PetStatsSchema.parse(config.initialStats)).not.toThrow();
    }
  });
});

describe('PetSchema', () => {
  it('should validate a full pet object', () => {
    const pet = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'TestPet',
      startingClass: 'Chill' as const,
      stats: { hunger: 80, happiness: 90, energy: 70, health: 85, cleanliness: 80 },
      currentState: 'Idle' as const,
      xp: 0,
      level: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    expect(PetSchema.parse(pet)).toEqual(pet);
  });
});
