import { PetState } from '@neogochi/shared';

export class StateTransitionEvent {
  constructor(
    public readonly sessionId: string,
    public readonly petId: string,
    public readonly fromState: PetState,
    public readonly toState: PetState,
  ) {}
}
