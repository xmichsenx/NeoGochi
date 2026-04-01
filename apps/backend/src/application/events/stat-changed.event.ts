import { Pet as PetData } from '@neogochi/shared';

export class StatChangedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly pet: PetData,
  ) {}
}
