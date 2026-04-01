import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PET_STATE_PORT, PetStatePort } from '../ports/pet-state.port';
import {
  FeedCommand,
  PlayCommand,
  SleepCommand,
  WakeUpCommand,
  CleanCommand,
  HealCommand,
} from './action.commands';
import { StatChangedEvent } from '../events/stat-changed.event';
import { StateTransitionEvent } from '../events/state-transition.event';
import { Pet, PetAction } from '../../domain/pet.entity';
import { PetState } from '@neogochi/shared';

abstract class BaseActionHandler {
  constructor(
    @Inject(PET_STATE_PORT) protected readonly petStatePort: PetStatePort,
    protected readonly eventBus: EventBus,
  ) {}

  protected async executeAction(
    sessionId: string,
    action: PetAction,
    execute: (pet: Pet) => PetState | null,
  ) {
    const pet = await this.petStatePort.findBySessionId(sessionId);
    if (!pet) throw new Error('Pet not found');

    const previousState = pet.currentState;
    const result = execute(pet);
    if (result === null) throw new Error(`Cannot ${action} in current state: ${pet.currentState}`);

    await this.petStatePort.save(pet);
    this.eventBus.publish(new StatChangedEvent(sessionId, pet.toPlain()));

    if (previousState !== pet.currentState) {
      this.eventBus.publish(
        new StateTransitionEvent(sessionId, pet.id, previousState, pet.currentState),
      );
    }

    return pet;
  }
}

@CommandHandler(FeedCommand)
export class FeedHandler extends BaseActionHandler implements ICommandHandler<FeedCommand> {
  async execute(command: FeedCommand) {
    return this.executeAction(command.sessionId, 'feed', (pet) => pet.feed());
  }
}

@CommandHandler(PlayCommand)
export class PlayHandler extends BaseActionHandler implements ICommandHandler<PlayCommand> {
  async execute(command: PlayCommand) {
    return this.executeAction(command.sessionId, 'play', (pet) => pet.play());
  }
}

@CommandHandler(SleepCommand)
export class SleepHandler extends BaseActionHandler implements ICommandHandler<SleepCommand> {
  async execute(command: SleepCommand) {
    return this.executeAction(command.sessionId, 'sleep', (pet) => pet.sleep());
  }
}

@CommandHandler(WakeUpCommand)
export class WakeUpHandler extends BaseActionHandler implements ICommandHandler<WakeUpCommand> {
  async execute(command: WakeUpCommand) {
    return this.executeAction(command.sessionId, 'wakeUp', (pet) => pet.wakeUp());
  }
}

@CommandHandler(CleanCommand)
export class CleanHandler extends BaseActionHandler implements ICommandHandler<CleanCommand> {
  async execute(command: CleanCommand) {
    return this.executeAction(command.sessionId, 'clean', (pet) => pet.clean());
  }
}

@CommandHandler(HealCommand)
export class HealHandler extends BaseActionHandler implements ICommandHandler<HealCommand> {
  async execute(command: HealCommand) {
    return this.executeAction(command.sessionId, 'heal', (pet) => pet.heal());
  }
}
