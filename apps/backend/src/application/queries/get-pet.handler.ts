import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPetQuery } from './get-pet.query';
import { PET_STATE_PORT, PetStatePort } from '../ports/pet-state.port';
import { Pet as PetData } from '@neogochi/shared';

@QueryHandler(GetPetQuery)
export class GetPetHandler implements IQueryHandler<GetPetQuery> {
  constructor(@Inject(PET_STATE_PORT) private readonly petStatePort: PetStatePort) {}

  async execute(query: GetPetQuery): Promise<PetData | null> {
    const pet = await this.petStatePort.findBySessionId(query.sessionId);
    return pet?.toPlain() ?? null;
  }
}
