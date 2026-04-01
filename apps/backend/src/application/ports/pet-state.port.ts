import { Pet } from '../../domain/pet.entity';

export const PET_STATE_PORT = Symbol('PET_STATE_PORT');

export interface PetStatePort {
  save(pet: Pet): Promise<void>;
  findBySessionId(sessionId: string): Promise<Pet | null>;
  delete(sessionId: string): Promise<void>;
}
