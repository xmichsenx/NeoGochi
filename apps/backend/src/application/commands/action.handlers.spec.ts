import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  FeedHandler,
  PlayHandler,
  SleepHandler,
  WakeUpHandler,
  CleanHandler,
  HealHandler,
} from './action.handlers';
import {
  FeedCommand,
  PlayCommand,
  SleepCommand,
  WakeUpCommand,
  CleanCommand,
  HealCommand,
} from './action.commands';
import { PetStatePort } from '../ports/pet-state.port';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Pet } from '../../domain/pet.entity';
import { StatChangedEvent } from '../events/stat-changed.event';
import { StateTransitionEvent } from '../events/state-transition.event';

const SESSION_ID = 'session-123';

function createMockPet(overrides?: { currentState?: string }): Pet {
  return new Pet({
    id: 'pet-1',
    name: 'Buddy',
    startingClass: 'Chill',
    stats: { hunger: 50, happiness: 50, energy: 50, health: 50, cleanliness: 50 },
    currentState: (overrides?.currentState as any) ?? 'Idle',
    xp: 0,
    level: 1,
    createdAt: new Date().toISOString(),
  });
}

describe('Action Handlers', () => {
  let petStatePort: PetStatePort;
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    petStatePort = {
      save: vi.fn().mockResolvedValue(undefined),
      findBySessionId: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    eventEmitter = { emit: vi.fn() } as unknown as EventEmitter2;
  });

  describe('FeedHandler', () => {
    it('should feed the pet and increase hunger', async () => {
      const pet = createMockPet();
      const initialHunger = pet.stats.hunger;
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new FeedHandler(petStatePort, eventEmitter);
      const result = await handler.execute(new FeedCommand(SESSION_ID));

      expect(result.stats.hunger).toBeGreaterThan(initialHunger);
      expect(petStatePort.save).toHaveBeenCalledOnce();
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw if pet not found', async () => {
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const handler = new FeedHandler(petStatePort, eventEmitter);

      await expect(handler.execute(new FeedCommand(SESSION_ID))).rejects.toThrow('Pet not found');
    });

    it('should throw if pet cannot feed (e.g., Sleeping)', async () => {
      const pet = createMockPet({ currentState: 'Sleeping' });
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new FeedHandler(petStatePort, eventEmitter);
      await expect(handler.execute(new FeedCommand(SESSION_ID))).rejects.toThrow(
        'Cannot feed in current state',
      );
    });

    it('should emit stat.changed event after feeding', async () => {
      const pet = createMockPet();
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new FeedHandler(petStatePort, eventEmitter);
      await handler.execute(new FeedCommand(SESSION_ID));

      const calls = (eventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls;
      expect(
        calls.some(([name, e]) => name === 'stat.changed' && e instanceof StatChangedEvent),
      ).toBe(true);
    });
  });

  describe('PlayHandler', () => {
    it('should increase happiness and decrease energy', async () => {
      const pet = createMockPet();
      const initialHappiness = pet.stats.happiness;
      const initialEnergy = pet.stats.energy;
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new PlayHandler(petStatePort, eventEmitter);
      await handler.execute(new PlayCommand(SESSION_ID));

      expect(pet.stats.happiness).toBeGreaterThan(initialHappiness);
      expect(pet.stats.energy).toBeLessThan(initialEnergy);
    });

    it('should reject play when Dead', async () => {
      const pet = createMockPet({ currentState: 'Dead' });
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new PlayHandler(petStatePort, eventEmitter);
      await expect(handler.execute(new PlayCommand(SESSION_ID))).rejects.toThrow();
    });
  });

  describe('SleepHandler', () => {
    it('should transition pet to Sleeping state', async () => {
      const pet = createMockPet();
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new SleepHandler(petStatePort, eventEmitter);
      await handler.execute(new SleepCommand(SESSION_ID));

      expect(pet.currentState).toBe('Sleeping');
    });

    it('should emit state.transition event on state change', async () => {
      const pet = createMockPet();
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new SleepHandler(petStatePort, eventEmitter);
      await handler.execute(new SleepCommand(SESSION_ID));

      const calls = (eventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls;
      expect(
        calls.some(([name, e]) => name === 'state.transition' && e instanceof StateTransitionEvent),
      ).toBe(true);
    });
  });

  describe('WakeUpHandler', () => {
    it('should wake up a sleeping pet', async () => {
      const pet = createMockPet({ currentState: 'Sleeping' });
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new WakeUpHandler(petStatePort, eventEmitter);
      await handler.execute(new WakeUpCommand(SESSION_ID));

      expect(pet.currentState).toBe('Idle');
    });

    it('should reject wakeUp when Idle', async () => {
      const pet = createMockPet({ currentState: 'Idle' });
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new WakeUpHandler(petStatePort, eventEmitter);
      await expect(handler.execute(new WakeUpCommand(SESSION_ID))).rejects.toThrow();
    });
  });

  describe('CleanHandler', () => {
    it('should increase cleanliness', async () => {
      const pet = createMockPet();
      const initialCleanliness = pet.stats.cleanliness;
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new CleanHandler(petStatePort, eventEmitter);
      await handler.execute(new CleanCommand(SESSION_ID));

      expect(pet.stats.cleanliness).toBeGreaterThan(initialCleanliness);
    });

    it('should allow cleaning when Sick', async () => {
      const pet = createMockPet({ currentState: 'Sick' });
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new CleanHandler(petStatePort, eventEmitter);
      await expect(handler.execute(new CleanCommand(SESSION_ID))).resolves.toBeDefined();
    });
  });

  describe('HealHandler', () => {
    it('should heal a sick pet and transition to Idle', async () => {
      const pet = createMockPet({ currentState: 'Sick' });
      const initialHealth = pet.stats.health;
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new HealHandler(petStatePort, eventEmitter);
      await handler.execute(new HealCommand(SESSION_ID));

      expect(pet.currentState).toBe('Idle');
      expect(pet.stats.health).toBeGreaterThan(initialHealth);
    });

    it('should reject heal when not Sick', async () => {
      const pet = createMockPet({ currentState: 'Idle' });
      (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const handler = new HealHandler(petStatePort, eventEmitter);
      await expect(handler.execute(new HealCommand(SESSION_ID))).rejects.toThrow();
    });
  });
});
