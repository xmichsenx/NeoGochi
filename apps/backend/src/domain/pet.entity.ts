import {
  PetState,
  StartingClass,
  Pet as PetData,
  CLASS_CONFIGS,
  EVOLUTION_LEVELS,
  XP_PER_ACTION,
} from '@neogochi/shared';
import { PetStatsVO } from './pet-stats.vo';

export type PetAction = 'feed' | 'play' | 'sleep' | 'wakeUp' | 'clean' | 'heal';

export class Pet {
  readonly id: string;
  readonly name: string;
  readonly startingClass: StartingClass;
  private _stats: PetStatsVO;
  private _currentState: PetState;
  private _xp: number;
  private _level: number;
  readonly createdAt: string;

  constructor(data: PetData) {
    this.id = data.id;
    this.name = data.name;
    this.startingClass = data.startingClass;
    this._stats = new PetStatsVO(data.stats);
    this._currentState = data.currentState;
    this._xp = data.xp;
    this._level = data.level;
    this.createdAt = data.createdAt;
  }

  get stats(): PetStatsVO {
    return this._stats;
  }

  get currentState(): PetState {
    return this._currentState;
  }

  get xp(): number {
    return this._xp;
  }

  get level(): number {
    return this._level;
  }

  // ─── State Transitions ─────────────────────────────────────────

  canExecute(action: PetAction): boolean {
    if (this._currentState === 'Dead') return false;

    switch (action) {
      case 'feed':
        return this._currentState === 'Idle';
      case 'play':
        return this._currentState === 'Idle';
      case 'sleep':
        return this._currentState === 'Idle';
      case 'wakeUp':
        return this._currentState === 'Sleeping';
      case 'clean':
        return this._currentState === 'Idle' || this._currentState === 'Sick';
      case 'heal':
        return this._currentState === 'Sick';
      default:
        return false;
    }
  }

  feed(): PetState | null {
    if (!this.canExecute('feed')) return null;
    this._currentState = 'Eating';
    this._stats = this._stats.increase('hunger', 20);
    this.addXp(XP_PER_ACTION.feed);
    this._currentState = 'Idle';
    return this._currentState;
  }

  play(): PetState | null {
    if (!this.canExecute('play')) return null;
    this._currentState = 'Playing';
    this._stats = this._stats.increase('happiness', 15).decrease('energy', 10);
    this.addXp(XP_PER_ACTION.play);
    this._currentState = 'Idle';
    return this._currentState;
  }

  sleep(): PetState | null {
    if (!this.canExecute('sleep')) return null;
    this._currentState = 'Sleeping';
    return this._currentState;
  }

  wakeUp(): PetState | null {
    if (!this.canExecute('wakeUp')) return null;
    this._currentState = 'Idle';
    return this._currentState;
  }

  clean(): PetState | null {
    if (!this.canExecute('clean')) return null;
    this._stats = this._stats.increase('cleanliness', 25);
    this.addXp(XP_PER_ACTION.clean);
    return this._currentState;
  }

  heal(): PetState | null {
    if (!this.canExecute('heal')) return null;
    this._stats = this._stats.increase('health', 30).increase('cleanliness', 10);
    this.addXp(XP_PER_ACTION.heal);
    this._currentState = 'Idle';
    return this._currentState;
  }

  // ─── Tick Processing ──────────────────────────────────────────

  tick(decayRates: {
    hunger: number;
    happiness: number;
    energy: number;
    health: number;
    cleanliness: number;
  }): { died: boolean; evolved: boolean; previousState: PetState } {
    const previousState = this._currentState;

    if (this._currentState === 'Dead') {
      return { died: false, evolved: false, previousState };
    }

    const classConfig = CLASS_CONFIGS[this.startingClass];

    // Apply weighted decay
    if (this._currentState === 'Sleeping') {
      // While sleeping, restore energy, lower decay on other stats
      this._stats = this._stats
        .increase('energy', 5)
        .decrease('hunger', decayRates.hunger * classConfig.statWeights.hungerDecayRate * 0.5)
        .decrease(
          'cleanliness',
          decayRates.cleanliness * classConfig.statWeights.cleanlinessDecayRate * 0.5,
        );

      // Auto wake-up when energy is full
      if (this._stats.energy >= 100) {
        this._currentState = 'Idle';
      }
    } else {
      this._stats = this._stats.applyDecay({
        hunger: decayRates.hunger * classConfig.statWeights.hungerDecayRate,
        happiness: decayRates.happiness * classConfig.statWeights.happinessDecayRate,
        energy: decayRates.energy * classConfig.statWeights.energyDecayRate,
        health: decayRates.health * classConfig.statWeights.healthDecayRate,
        cleanliness: decayRates.cleanliness * classConfig.statWeights.cleanlinessDecayRate,
      });
    }

    // Check death
    if (this._stats.isDead()) {
      this._currentState = 'Dead';
      return { died: true, evolved: false, previousState };
    }

    // Check sickness (only transition from Idle)
    if (this._currentState === 'Idle' && this._stats.isSick()) {
      this._currentState = 'Sick';
    }

    // Check evolution
    const evolved = this.checkEvolution();

    return { died: false, evolved, previousState };
  }

  // ─── XP & Evolution ───────────────────────────────────────────

  private addXp(amount: number): void {
    this._xp += amount;
  }

  private checkEvolution(): boolean {
    const xpForNextLevel = this._level * 50;
    if (this._xp >= xpForNextLevel) {
      this._xp -= xpForNextLevel;
      this._level++;

      if (EVOLUTION_LEVELS.includes(this._level as (typeof EVOLUTION_LEVELS)[number])) {
        const prevState = this._currentState;
        this._currentState = 'Evolution';
        // Evolution state is brief — return to previous state
        this._currentState = prevState === 'Sick' ? 'Idle' : prevState;
        return true;
      }
    }
    return false;
  }

  // ─── Serialization ────────────────────────────────────────────

  toPlain(): PetData {
    return {
      id: this.id,
      name: this.name,
      startingClass: this.startingClass,
      stats: this._stats.toPlain(),
      currentState: this._currentState,
      xp: this._xp,
      level: this._level,
      createdAt: this.createdAt,
    };
  }

  static create(id: string, name: string, startingClass: StartingClass): Pet {
    return new Pet({
      id,
      name,
      startingClass,
      stats: PetStatsVO.fromClass(startingClass).toPlain(),
      currentState: 'Idle',
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
    });
  }
}
