import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TickHandler } from './tick.handler';
import { TickCommand } from './tick.command';
import { PetStatePort } from '../ports/pet-state.port';
import { PetGraveyardPort } from '../ports/pet-graveyard.port';
import { TickSchedulerPort } from '../ports/tick-scheduler.port';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { Pet } from '../../domain/pet.entity';
import { StatChangedEvent } from '../events/stat-changed.event';
import { PetDiedEvent } from '../events/pet-died.event';
import { PetEvolvedEvent } from '../events/pet-evolved.event';

const SESSION_ID = 'session-tick-1';

function createMockPet(
  overrides?: Partial<{
    hunger: number;
    happiness: number;
    energy: number;
    health: number;
    cleanliness: number;
    currentState: string;
    xp: number;
    level: number;
  }>,
): Pet {
  return new Pet({
    id: 'pet-tick-1',
    name: 'TickBuddy',
    startingClass: 'Chill',
    stats: {
      hunger: overrides?.hunger ?? 50,
      happiness: overrides?.happiness ?? 50,
      energy: overrides?.energy ?? 50,
      health: overrides?.health ?? 50,
      cleanliness: overrides?.cleanliness ?? 50,
    },
    currentState: (overrides?.currentState as any) ?? 'Idle',
    xp: overrides?.xp ?? 0,
    level: overrides?.level ?? 1,
    createdAt: new Date().toISOString(),
  });
}

describe('TickHandler', () => {
  let handler: TickHandler;
  let petStatePort: PetStatePort;
  let graveyardPort: PetGraveyardPort;
  let tickScheduler: TickSchedulerPort;
  let eventEmitter: EventEmitter2;
  let configService: ConfigService;

  beforeEach(() => {
    petStatePort = {
      save: vi.fn().mockResolvedValue(undefined),
      findBySessionId: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    graveyardPort = {
      bury: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue({ entries: [], total: 0 }),
    };

    tickScheduler = {
      scheduleTickJob: vi.fn().mockResolvedValue(undefined),
      removeTickJob: vi.fn().mockResolvedValue(undefined),
    };

    eventEmitter = { emit: vi.fn() } as unknown as EventEmitter2;

    configService = {
      get: vi.fn((key: string, defaultValue: number) => defaultValue),
    } as unknown as ConfigService;

    handler = new TickHandler(
      petStatePort,
      graveyardPort,
      tickScheduler,
      eventEmitter,
      configService,
    );
  });

  it('should do nothing if pet not found', async () => {
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await handler.execute(new TickCommand(SESSION_ID));

    expect(petStatePort.save).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should decay stats on tick', async () => {
    const pet = createMockPet();
    const initialHunger = pet.stats.hunger;
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

    await handler.execute(new TickCommand(SESSION_ID));

    expect(pet.stats.hunger).toBeLessThan(initialHunger);
    expect(petStatePort.save).toHaveBeenCalledOnce();
    expect(eventEmitter.emit).toHaveBeenCalled();
  });

  it('should emit stat.changed event on tick', async () => {
    const pet = createMockPet();
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

    await handler.execute(new TickCommand(SESSION_ID));

    const calls = (eventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls;
    expect(
      calls.some(([name, e]) => name === 'stat.changed' && e instanceof StatChangedEvent),
    ).toBe(true);
  });

  it('should kill pet when health reaches 0', async () => {
    const pet = createMockPet({ health: 1, hunger: 1 });
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

    await handler.execute(new TickCommand(SESSION_ID));

    expect(graveyardPort.bury).toHaveBeenCalledOnce();
    expect(petStatePort.delete).toHaveBeenCalledWith(SESSION_ID);
    expect(tickScheduler.removeTickJob).toHaveBeenCalledWith(SESSION_ID);

    const calls = (eventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.some(([name, e]) => name === 'pet.died' && e instanceof PetDiedEvent)).toBe(true);
  });

  it('should not save pet to state port when it dies', async () => {
    const pet = createMockPet({ health: 1, hunger: 1 });
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

    await handler.execute(new TickCommand(SESSION_ID));

    expect(petStatePort.save).not.toHaveBeenCalled();
    expect(petStatePort.delete).toHaveBeenCalled();
  });

  it('should transition Idle pet to Sick when stats are critical', async () => {
    const pet = createMockPet({ cleanliness: 5, health: 20 });
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

    await handler.execute(new TickCommand(SESSION_ID));

    expect(pet.currentState).toBe('Sick');
  });

  it('should restore energy during sleep tick', async () => {
    const pet = createMockPet({ currentState: 'Sleeping', energy: 50 });
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

    await handler.execute(new TickCommand(SESSION_ID));

    expect(pet.stats.energy).toBeGreaterThan(50);
  });

  it('should auto wake up when energy reaches 100 during sleep', async () => {
    const pet = createMockPet({ currentState: 'Sleeping', energy: 96 });
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

    await handler.execute(new TickCommand(SESSION_ID));

    expect(pet.currentState).toBe('Idle');
  });
});
