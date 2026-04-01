export class PetEvolvedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly petId: string,
    public readonly newLevel: number,
    public readonly previousLevel: number,
  ) {}
}
