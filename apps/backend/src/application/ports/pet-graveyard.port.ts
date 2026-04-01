import { Pet } from '../../domain/pet.entity';

export const PET_GRAVEYARD_PORT = Symbol('PET_GRAVEYARD_PORT');

export interface PetGraveyardPort {
  bury(pet: Pet, causeOfDeath: string): Promise<void>;
  findAll(page: number, limit: number): Promise<{ entries: GraveyardEntry[]; total: number }>;
}

export interface GraveyardEntry {
  id: string;
  name: string;
  startingClass: string;
  finalLevel: number;
  daysSurvived: number;
  causeOfDeath: string;
  statsSnapshot: Record<string, number>;
  diedAt: string;
}
