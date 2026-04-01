import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePetHandler } from './create-pet.handler';
import { CreatePetCommand } from './create-pet.command';
import { PetStatePort } from '../ports/pet-state.port';
import { TickSchedulerPort } from '../ports/tick-scheduler.port';
import { EventBus } from '@nestjs/cqrs';
import { PetCreatedEvent } from '../events/pet-created.event';

describe('CreatePetHandler', () => {
  let handler: CreatePetHandler;
  let petStatePort: PetStatePort;
  let tickScheduler: TickSchedulerPort;
  let eventBus: EventBus;

  beforeEach(() => {
    petStatePort = {
      save: vi.fn().mockResolvedValue(undefined),
      findBySessionId: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    tickScheduler = {
      scheduleTickJob: vi.fn().mockResolvedValue(undefined),
      removeTickJob: vi.fn().mockResolvedValue(undefined),
    };

    eventBus = { publish: vi.fn() } as unknown as EventBus;

    handler = new CreatePetHandler(petStatePort, tickScheduler, eventBus);
  });

  it('should create a pet and save it', async () => {
    const command = new CreatePetCommand('session-1', 'Luna', 'Chill');
    const pet = await handler.execute(command);

    expect(pet.name).toBe('Luna');
    expect(pet.startingClass).toBe('Chill');
    expect(pet.currentState).toBe('Idle');
    expect(petStatePort.save).toHaveBeenCalledOnce();
  });

  it('should schedule a tick job for the session', async () => {
    const command = new CreatePetCommand('session-1', 'Luna', 'Chill');
    await handler.execute(command);

    expect(tickScheduler.scheduleTickJob).toHaveBeenCalledWith('session-1');
  });

  it('should publish a PetCreatedEvent', async () => {
    const command = new CreatePetCommand('session-1', 'Luna', 'Chill');
    const pet = await handler.execute(command);

    expect(eventBus.publish).toHaveBeenCalledOnce();
    const event = (eventBus.publish as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(event).toBeInstanceOf(PetCreatedEvent);
    expect(event.sessionId).toBe('session-1');
    expect(event.pet.name).toBe('Luna');
  });

  it('should create pets with different starting classes', async () => {
    const aggressive = await handler.execute(new CreatePetCommand('s1', 'Aggro', 'Aggressive'));
    expect(aggressive.startingClass).toBe('Aggressive');

    const intellectual = await handler.execute(
      new CreatePetCommand('s2', 'Smarty', 'Intellectual'),
    );
    expect(intellectual.startingClass).toBe('Intellectual');
  });
});
