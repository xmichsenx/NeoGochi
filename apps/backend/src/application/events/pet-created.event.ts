import { Pet as PetData } from '@neogochi/shared';

export class PetCreatedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly pet: PetData,
  ) {}
}
