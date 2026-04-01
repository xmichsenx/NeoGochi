export class PetDiedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly petId: string,
    public readonly name: string,
    public readonly finalLevel: number,
    public readonly causeOfDeath: string,
  ) {}
}
