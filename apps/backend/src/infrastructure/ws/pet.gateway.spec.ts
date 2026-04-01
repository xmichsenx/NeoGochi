import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PetGateway } from './pet.gateway';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { WS_EVENTS } from '@neogochi/shared';
import { Socket, Server } from 'socket.io';

describe('PetGateway', () => {
  let gateway: PetGateway;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  function createMockSocket(id: string, sessionId?: string): Socket {
    return {
      id,
      handshake: { query: sessionId ? { sessionId } : {} },
      emit: vi.fn(),
    } as unknown as Socket;
  }

  beforeEach(() => {
    commandBus = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as CommandBus;

    queryBus = {
      execute: vi.fn().mockResolvedValue(null),
    } as unknown as QueryBus;

    gateway = new PetGateway(commandBus, queryBus);
    gateway.server = {
      to: vi.fn().mockReturnValue({ emit: vi.fn() }),
    } as unknown as Server;
  });

  describe('handleConnection', () => {
    it('should map socket to session on connect with sessionId', async () => {
      const client = createMockSocket('socket-1', 'session-abc');
      await gateway.handleConnection(client);

      // Verify session is tracked by triggering a feed
      (commandBus.execute as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      await gateway.handleFeed(client);

      expect(commandBus.execute).toHaveBeenCalled();
    });

    it('should send current pet state if reconnecting', async () => {
      const petData = { id: 'pet-1', name: 'Buddy', stats: {} };
      (queryBus.execute as ReturnType<typeof vi.fn>).mockResolvedValue(petData);

      const client = createMockSocket('socket-1', 'session-abc');
      await gateway.handleConnection(client);

      expect(client.emit).toHaveBeenCalledWith(WS_EVENTS.PET_UPDATE, petData);
    });
  });

  describe('handleCreatePet', () => {
    it('should create a pet with valid data', async () => {
      const pet = {
        id: 'pet-new',
        toPlain: () => ({ id: 'pet-new', name: 'NewPet' }),
      };
      (commandBus.execute as ReturnType<typeof vi.fn>).mockResolvedValue(pet);

      const client = createMockSocket('socket-1');
      await gateway.handleCreatePet({ name: 'NewPet', startingClass: 'Chill' }, client);

      expect(commandBus.execute).toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith(WS_EVENTS.PET_UPDATE, {
        id: 'pet-new',
        name: 'NewPet',
      });
    });

    it('should emit error for invalid create data', async () => {
      const client = createMockSocket('socket-1');
      await gateway.handleCreatePet({ name: '' }, client);

      expect(client.emit).toHaveBeenCalledWith(
        WS_EVENTS.ERROR,
        expect.objectContaining({ message: 'Invalid create pet data' }),
      );
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up session mapping on disconnect', async () => {
      const client = createMockSocket('socket-1', 'session-abc');
      await gateway.handleConnection(client);

      gateway.handleDisconnect(client);

      // After disconnect, actions should fail with "no pet"
      const newClient = createMockSocket('socket-1');
      await gateway.handleFeed(newClient);
      expect(newClient.emit).toHaveBeenCalledWith(
        WS_EVENTS.ERROR,
        expect.objectContaining({ message: 'No pet associated with this session' }),
      );
    });
  });

  describe('rate limiting', () => {
    it('should reject actions when no session exists', async () => {
      const client = createMockSocket('socket-no-session');
      await gateway.handleFeed(client);

      expect(client.emit).toHaveBeenCalledWith(
        WS_EVENTS.ERROR,
        expect.objectContaining({ message: 'No pet associated with this session' }),
      );
    });

    it('should reject rapid repeated actions (cooldown)', async () => {
      const client = createMockSocket('socket-1', 'session-cd');
      await gateway.handleConnection(client);

      // First feed should succeed
      await gateway.handleFeed(client);
      expect(commandBus.execute).toHaveBeenCalledTimes(1);

      // Second immediate feed should be rejected (cooldown)
      await gateway.handleFeed(client);
      expect(client.emit).toHaveBeenCalledWith(
        WS_EVENTS.ERROR,
        expect.objectContaining({ message: expect.stringContaining('cooldown') }),
      );
    });
  });

  describe('action forwarding', () => {
    it('should emit error when command throws', async () => {
      const client = createMockSocket('socket-1', 'session-err');
      await gateway.handleConnection(client);

      (commandBus.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Cannot feed in current state: Sleeping'),
      );

      await gateway.handleFeed(client);

      expect(client.emit).toHaveBeenCalledWith(
        WS_EVENTS.ERROR,
        expect.objectContaining({ message: 'Cannot feed in current state: Sleeping' }),
      );
    });
  });
});
