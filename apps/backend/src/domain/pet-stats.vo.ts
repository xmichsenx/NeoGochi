import { PetStats, PetState, StartingClass, CLASS_CONFIGS } from '@neogochi/shared';

export class PetStatsVO {
  readonly hunger: number;
  readonly happiness: number;
  readonly energy: number;
  readonly health: number;
  readonly cleanliness: number;

  constructor(stats: PetStats) {
    this.hunger = PetStatsVO.clamp(stats.hunger);
    this.happiness = PetStatsVO.clamp(stats.happiness);
    this.energy = PetStatsVO.clamp(stats.energy);
    this.health = PetStatsVO.clamp(stats.health);
    this.cleanliness = PetStatsVO.clamp(stats.cleanliness);
  }

  private static clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  applyDecay(rates: {
    hunger: number;
    happiness: number;
    energy: number;
    health: number;
    cleanliness: number;
  }): PetStatsVO {
    return new PetStatsVO({
      hunger: this.hunger - rates.hunger,
      happiness: this.happiness - rates.happiness,
      energy: this.energy - rates.energy,
      health: this.health - rates.health,
      cleanliness: this.cleanliness - rates.cleanliness,
    });
  }

  withChanges(changes: Partial<PetStats>): PetStatsVO {
    return new PetStatsVO({
      hunger: changes.hunger ?? this.hunger,
      happiness: changes.happiness ?? this.happiness,
      energy: changes.energy ?? this.energy,
      health: changes.health ?? this.health,
      cleanliness: changes.cleanliness ?? this.cleanliness,
    });
  }

  increase(stat: keyof PetStats, amount: number): PetStatsVO {
    return this.withChanges({ [stat]: (this[stat] as number) + amount });
  }

  decrease(stat: keyof PetStats, amount: number): PetStatsVO {
    return this.withChanges({ [stat]: (this[stat] as number) - amount });
  }

  toPlain(): PetStats {
    return {
      hunger: this.hunger,
      happiness: this.happiness,
      energy: this.energy,
      health: this.health,
      cleanliness: this.cleanliness,
    };
  }

  isDead(): boolean {
    return this.health <= 0 || this.hunger <= 0;
  }

  isSick(): boolean {
    return this.cleanliness <= 0 || this.health <= 20;
  }

  static fromClass(startingClass: StartingClass): PetStatsVO {
    return new PetStatsVO(CLASS_CONFIGS[startingClass].initialStats);
  }
}
