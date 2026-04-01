import { describe, it, expect } from 'vitest';
import { PetStatsVO } from './pet-stats.vo';

describe('PetStatsVO', () => {
  it('should clamp values between 0 and 100', () => {
    const stats = new PetStatsVO({
      hunger: 150,
      happiness: -20,
      energy: 50,
      health: 100,
      cleanliness: 0,
    });
    expect(stats.hunger).toBe(100);
    expect(stats.happiness).toBe(0);
    expect(stats.energy).toBe(50);
    expect(stats.health).toBe(100);
    expect(stats.cleanliness).toBe(0);
  });

  it('should apply decay correctly', () => {
    const stats = new PetStatsVO({
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 50,
      cleanliness: 50,
    });
    const decayed = stats.applyDecay({
      hunger: 5,
      happiness: 3,
      energy: 2,
      health: 1,
      cleanliness: 4,
    });
    expect(decayed.hunger).toBe(45);
    expect(decayed.happiness).toBe(47);
    expect(decayed.energy).toBe(48);
    expect(decayed.health).toBe(49);
    expect(decayed.cleanliness).toBe(46);
  });

  it('should increase a stat', () => {
    const stats = new PetStatsVO({
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 50,
      cleanliness: 50,
    });
    const increased = stats.increase('hunger', 20);
    expect(increased.hunger).toBe(70);
    expect(increased.happiness).toBe(50);
  });

  it('should decrease a stat', () => {
    const stats = new PetStatsVO({
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 50,
      cleanliness: 50,
    });
    const decreased = stats.decrease('energy', 15);
    expect(decreased.energy).toBe(35);
  });

  it('should detect death condition', () => {
    const deadByHunger = new PetStatsVO({
      hunger: 0,
      happiness: 50,
      energy: 50,
      health: 50,
      cleanliness: 50,
    });
    expect(deadByHunger.isDead()).toBe(true);

    const deadByHealth = new PetStatsVO({
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 0,
      cleanliness: 50,
    });
    expect(deadByHealth.isDead()).toBe(true);

    const alive = new PetStatsVO({
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 50,
      cleanliness: 50,
    });
    expect(alive.isDead()).toBe(false);
  });

  it('should detect sickness condition', () => {
    const sickByCleanliness = new PetStatsVO({
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 50,
      cleanliness: 0,
    });
    expect(sickByCleanliness.isSick()).toBe(true);

    const sickByHealth = new PetStatsVO({
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 15,
      cleanliness: 50,
    });
    expect(sickByHealth.isSick()).toBe(true);
  });

  it('should create initial stats from class', () => {
    const stats = PetStatsVO.fromClass('Chill');
    expect(stats.hunger).toBe(80);
    expect(stats.happiness).toBe(90);
  });

  it('should serialize to plain object', () => {
    const stats = new PetStatsVO({
      hunger: 50,
      happiness: 60,
      energy: 70,
      health: 80,
      cleanliness: 90,
    });
    const plain = stats.toPlain();
    expect(plain).toEqual({
      hunger: 50,
      happiness: 60,
      energy: 70,
      health: 80,
      cleanliness: 90,
    });
  });
});
