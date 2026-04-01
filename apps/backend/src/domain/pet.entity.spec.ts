import { describe, it, expect } from 'vitest';
import { Pet } from './pet.entity';

describe('Pet Entity', () => {
  const createTestPet = (overrides?: Partial<Parameters<typeof Pet.create>[2]>) => {
    return Pet.create('550e8400-e29b-41d4-a716-446655440000', 'TestPet', 'Chill');
  };

  describe('creation', () => {
    it('should create a pet with initial values', () => {
      const pet = createTestPet();
      expect(pet.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(pet.name).toBe('TestPet');
      expect(pet.startingClass).toBe('Chill');
      expect(pet.currentState).toBe('Idle');
      expect(pet.level).toBe(1);
      expect(pet.xp).toBe(0);
    });

    it('should use class-specific initial stats', () => {
      const aggressivePet = Pet.create(
        'a0000000-0000-0000-0000-000000000001',
        'Aggro',
        'Aggressive',
      );
      expect(aggressivePet.stats.energy).toBe(100);
      expect(aggressivePet.stats.happiness).toBe(60);

      const chillPet = Pet.create('c0000000-0000-0000-0000-000000000001', 'Chill', 'Chill');
      expect(chillPet.stats.happiness).toBe(90);
    });
  });

  describe('actions', () => {
    it('should feed the pet', () => {
      const pet = createTestPet();
      const result = pet.feed();
      expect(result).toBe('Idle');
      expect(pet.stats.hunger).toBeGreaterThan(80); // Chill starts at 80
    });

    it('should play with the pet', () => {
      const pet = createTestPet();
      const result = pet.play();
      expect(result).toBe('Idle');
      expect(pet.stats.happiness).toBeGreaterThan(90); // increased
      expect(pet.stats.energy).toBeLessThan(70); // decreased (Chill starts at 70)
    });

    it('should put the pet to sleep', () => {
      const pet = createTestPet();
      const result = pet.sleep();
      expect(result).toBe('Sleeping');
      expect(pet.currentState).toBe('Sleeping');
    });

    it('should wake up the pet', () => {
      const pet = createTestPet();
      pet.sleep();
      const result = pet.wakeUp();
      expect(result).toBe('Idle');
    });

    it('should clean the pet', () => {
      const pet = createTestPet();
      const initialCleanliness = pet.stats.cleanliness;
      pet.clean();
      expect(pet.stats.cleanliness).toBe(Math.min(100, initialCleanliness + 25));
    });

    it('should not allow play when sleeping', () => {
      const pet = createTestPet();
      pet.sleep();
      const result = pet.play();
      expect(result).toBeNull();
    });

    it('should not allow actions when dead', () => {
      const pet = new Pet({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'DeadPet',
        startingClass: 'Chill',
        stats: { hunger: 50, happiness: 50, energy: 50, health: 50, cleanliness: 50 },
        currentState: 'Dead',
        xp: 0,
        level: 1,
        createdAt: new Date().toISOString(),
      });
      expect(pet.feed()).toBeNull();
      expect(pet.play()).toBeNull();
      expect(pet.sleep()).toBeNull();
    });
  });

  describe('tick', () => {
    const decayRates = { hunger: 3, happiness: 2, energy: 2, health: 1, cleanliness: 2 };

    it('should apply stat decay on tick', () => {
      const pet = createTestPet();
      const initialHunger = pet.stats.hunger;
      pet.tick(decayRates);
      expect(pet.stats.hunger).toBeLessThan(initialHunger);
    });

    it('should transition to Dead when stats are too low', () => {
      const pet = new Pet({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'DyingPet',
        startingClass: 'Chill',
        stats: { hunger: 1, happiness: 50, energy: 50, health: 50, cleanliness: 50 },
        currentState: 'Idle',
        xp: 0,
        level: 1,
        createdAt: new Date().toISOString(),
      });
      const result = pet.tick(decayRates);
      expect(result.died).toBe(true);
      expect(pet.currentState).toBe('Dead');
    });

    it('should transition to Sick when cleanliness hits 0', () => {
      const pet = new Pet({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'DirtyPet',
        startingClass: 'Chill',
        stats: { hunger: 80, happiness: 50, energy: 50, health: 50, cleanliness: 2 },
        currentState: 'Idle',
        xp: 0,
        level: 1,
        createdAt: new Date().toISOString(),
      });
      pet.tick(decayRates);
      expect(pet.currentState).toBe('Sick');
    });

    it('should restore energy while sleeping', () => {
      const pet = new Pet({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'SleepyPet',
        startingClass: 'Chill',
        stats: { hunger: 80, happiness: 50, energy: 30, health: 50, cleanliness: 50 },
        currentState: 'Sleeping',
        xp: 0,
        level: 1,
        createdAt: new Date().toISOString(),
      });
      const initialEnergy = pet.stats.energy;
      pet.tick(decayRates);
      expect(pet.stats.energy).toBeGreaterThan(initialEnergy);
    });

    it('should auto wake-up when energy is full while sleeping', () => {
      const pet = new Pet({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'RestedPet',
        startingClass: 'Chill',
        stats: { hunger: 80, happiness: 50, energy: 98, health: 50, cleanliness: 50 },
        currentState: 'Sleeping',
        xp: 0,
        level: 1,
        createdAt: new Date().toISOString(),
      });
      pet.tick(decayRates);
      expect(pet.currentState).toBe('Idle');
    });

    it('should not process ticks for dead pets', () => {
      const pet = new Pet({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'DeadPet',
        startingClass: 'Chill',
        stats: { hunger: 50, happiness: 50, energy: 50, health: 50, cleanliness: 50 },
        currentState: 'Dead',
        xp: 0,
        level: 1,
        createdAt: new Date().toISOString(),
      });
      const result = pet.tick(decayRates);
      expect(result.died).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize to plain object', () => {
      const pet = createTestPet();
      const plain = pet.toPlain();
      expect(plain.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(plain.name).toBe('TestPet');
      expect(plain.stats).toBeDefined();
      expect(plain.currentState).toBe('Idle');
    });

    it('should roundtrip through serialization', () => {
      const pet = createTestPet();
      const plain = pet.toPlain();
      const restored = new Pet(plain);
      expect(restored.toPlain()).toEqual(plain);
    });
  });
});
