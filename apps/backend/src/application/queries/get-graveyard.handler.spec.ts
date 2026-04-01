import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetGraveyardHandler } from './get-graveyard.handler';
import { GetGraveyardQuery } from './get-graveyard.query';
import { PetGraveyardPort, GraveyardEntry } from '../ports/pet-graveyard.port';

describe('GetGraveyardHandler', () => {
  let handler: GetGraveyardHandler;
  let graveyardPort: PetGraveyardPort;

  const mockEntries: GraveyardEntry[] = [
    {
      id: 'dead-1',
      name: 'Fallen',
      startingClass: 'Aggressive',
      finalLevel: 5,
      daysSurvived: 3,
      causeOfDeath: 'Starvation',
      statsSnapshot: { hunger: 0, happiness: 10, energy: 5, health: 0, cleanliness: 10 },
      diedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    graveyardPort = {
      bury: vi.fn(),
      findAll: vi.fn().mockResolvedValue({ entries: mockEntries, total: 1 }),
    };
    handler = new GetGraveyardHandler(graveyardPort);
  });

  it('should return graveyard entries with total count', async () => {
    const result = await handler.execute(new GetGraveyardQuery(1, 20));

    expect(result.entries).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.entries[0].name).toBe('Fallen');
  });

  it('should pass pagination parameters to the port', async () => {
    await handler.execute(new GetGraveyardQuery(2, 10));

    expect(graveyardPort.findAll).toHaveBeenCalledWith(2, 10);
  });

  it('should return empty result when no dead pets', async () => {
    (graveyardPort.findAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      entries: [],
      total: 0,
    });

    const result = await handler.execute(new GetGraveyardQuery(1, 20));

    expect(result.entries).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
