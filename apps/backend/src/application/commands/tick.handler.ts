import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { TickCommand } from './tick.command';
import { PET_STATE_PORT, PetStatePort } from '../ports/pet-state.port';
import { PET_GRAVEYARD_PORT, PetGraveyardPort } from '../ports/pet-graveyard.port';
import { TICK_SCHEDULER_PORT, TickSchedulerPort } from '../ports/tick-scheduler.port';
import { StatChangedEvent } from '../events/stat-changed.event';
import { StateTransitionEvent } from '../events/state-transition.event';
import { PetDiedEvent } from '../events/pet-died.event';
import { PetEvolvedEvent } from '../events/pet-evolved.event';

@CommandHandler(TickCommand)
export class TickHandler implements ICommandHandler<TickCommand> {
  constructor(
    @Inject(PET_STATE_PORT) private readonly petStatePort: PetStatePort,
    @Inject(PET_GRAVEYARD_PORT) private readonly graveyardPort: PetGraveyardPort,
    @Inject(TICK_SCHEDULER_PORT) private readonly tickScheduler: TickSchedulerPort,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: TickCommand) {
    const pet = await this.petStatePort.findBySessionId(command.sessionId);
    if (!pet) return;

    const decayRates = {
      hunger: this.configService.get<number>('game.statDecay.hunger', 3),
      happiness: this.configService.get<number>('game.statDecay.happiness', 2),
      energy: this.configService.get<number>('game.statDecay.energy', 2),
      health: this.configService.get<number>('game.statDecay.health', 1),
      cleanliness: this.configService.get<number>('game.statDecay.cleanliness', 2),
    };

    const previousLevel = pet.level;
    const result = pet.tick(decayRates);

    if (result.died) {
      const causeOfDeath = pet.stats.hunger <= 0 ? 'Starvation' : 'Health failure';
      await this.graveyardPort.bury(pet, causeOfDeath);
      await this.petStatePort.delete(command.sessionId);
      await this.tickScheduler.removeTickJob(command.sessionId);
      this.eventEmitter.emit(
        'pet.died',
        new PetDiedEvent(command.sessionId, pet.id, pet.name, pet.level, causeOfDeath),
      );
      return;
    }

    await this.petStatePort.save(pet);
    this.eventEmitter.emit('stat.changed', new StatChangedEvent(command.sessionId, pet.toPlain()));

    if (result.previousState !== pet.currentState) {
      this.eventEmitter.emit(
        'state.transition',
        new StateTransitionEvent(command.sessionId, pet.id, result.previousState, pet.currentState),
      );
    }

    if (result.evolved) {
      this.eventEmitter.emit(
        'pet.evolved',
        new PetEvolvedEvent(command.sessionId, pet.id, pet.level, previousLevel),
      );
    }
  }
}
