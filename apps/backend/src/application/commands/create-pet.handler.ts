import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Pet } from '../../domain/pet.entity';
import { CreatePetCommand } from './create-pet.command';
import { PET_STATE_PORT, PetStatePort } from '../ports/pet-state.port';
import { TICK_SCHEDULER_PORT, TickSchedulerPort } from '../ports/tick-scheduler.port';
import { PetCreatedEvent } from '../events/pet-created.event';

@CommandHandler(CreatePetCommand)
export class CreatePetHandler implements ICommandHandler<CreatePetCommand> {
  constructor(
    @Inject(PET_STATE_PORT) private readonly petStatePort: PetStatePort,
    @Inject(TICK_SCHEDULER_PORT) private readonly tickScheduler: TickSchedulerPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreatePetCommand): Promise<Pet> {
    const pet = Pet.create(uuidv4(), command.name, command.startingClass);
    await this.petStatePort.save(pet);
    await this.tickScheduler.scheduleTickJob(command.sessionId);
    this.eventBus.publish(new PetCreatedEvent(command.sessionId, pet.toPlain()));
    return pet;
  }
}
