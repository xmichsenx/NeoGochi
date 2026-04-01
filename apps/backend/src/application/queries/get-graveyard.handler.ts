import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGraveyardQuery } from './get-graveyard.query';
import { PET_GRAVEYARD_PORT, PetGraveyardPort, GraveyardEntry } from '../ports/pet-graveyard.port';

@QueryHandler(GetGraveyardQuery)
export class GetGraveyardHandler implements IQueryHandler<GetGraveyardQuery> {
  constructor(@Inject(PET_GRAVEYARD_PORT) private readonly graveyardPort: PetGraveyardPort) {}

  async execute(query: GetGraveyardQuery): Promise<{ entries: GraveyardEntry[]; total: number }> {
    return this.graveyardPort.findAll(query.page, query.limit);
  }
}
