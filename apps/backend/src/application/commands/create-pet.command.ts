import { StartingClass } from '@neogochi/shared';

export class CreatePetCommand {
  constructor(
    public readonly sessionId: string,
    public readonly name: string,
    public readonly startingClass: StartingClass,
  ) {}
}
