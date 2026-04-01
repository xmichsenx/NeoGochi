import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPetHandler } from './get-pet.handler';
import { GetPetQuery } from './get-pet.query';
import { PetStatePort } from '../ports/pet-state.port';
import { Pet } from '../../domain/pet.entity';

describe('GetPetHandler', () => {
  let handler: GetPetHandler;
  let petStatePort: PetStatePort;

  beforeEach(() => {
    petStatePort = {
      save: vi.fn(),
      findBySessionId: vi.fn(),
      delete: vi.fn(),
    };
    handler = new GetPetHandler(petStatePort);
  });

  it('should return pet data when pet exists', async () => {
    const pet = Pet.create('pet-1', 'Buddy', 'Chill');
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

    const result = await handler.execute(new GetPetQuery('session-1'));

    expect(result).toBeDefined();
    expect(result!.name).toBe('Buddy');
    expect(result!.startingClass).toBe('Chill');
    expect(petStatePort.findBySessionId).toHaveBeenCalledWith('session-1');
  });

  it('should return null when pet does not exist', async () => {
    (petStatePort.findBySessionId as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await handler.execute(new GetPetQuery('nonexistent'));

    expect(result).toBeNull();
  });
});
