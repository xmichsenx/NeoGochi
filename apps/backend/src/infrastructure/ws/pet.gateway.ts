import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { CreatePetDtoSchema, WS_EVENTS } from '@neogochi/shared';
import { CreatePetCommand } from '../../application/commands/create-pet.command';
import {
  FeedCommand,
  PlayCommand,
  SleepCommand,
  WakeUpCommand,
  CleanCommand,
  HealCommand,
} from '../../application/commands/action.commands';
import { GetPetQuery } from '../../application/queries/get-pet.query';
import { PetCreatedEvent } from '../../application/events/pet-created.event';
import { StatChangedEvent } from '../../application/events/stat-changed.event';
import { StateTransitionEvent } from '../../application/events/state-transition.event';
import { PetDiedEvent } from '../../application/events/pet-died.event';
import { PetEvolvedEvent } from '../../application/events/pet-evolved.event';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PetGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Map socket.id → sessionId (petId)
  private readonly socketToSession = new Map<string, string>();
  private readonly sessionToSocket = new Map<string, string>();

  // Rate limiting: sessionId → Map<action, lastExecutedTimestamp>
  private readonly actionCooldowns = new Map<string, Map<string, number>>();

  // Cooldown durations in ms per action
  private readonly COOLDOWN_MS: Record<string, number> = {
    feed: 3000,
    play: 3000,
    sleep: 5000,
    wakeUp: 1000,
    clean: 3000,
    heal: 5000,
  };

  // Global rate limit: max actions per window
  private readonly RATE_LIMIT_WINDOW_MS = 10_000;
  private readonly RATE_LIMIT_MAX_ACTIONS = 10;
  private readonly actionTimestamps = new Map<string, number[]>();

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async handleConnection(client: Socket) {
    const sessionId = client.handshake.query['sessionId'] as string | undefined;
    if (sessionId) {
      this.socketToSession.set(client.id, sessionId);
      this.sessionToSocket.set(sessionId, client.id);

      // Send current pet state if reconnecting
      const pet = await this.queryBus.execute(new GetPetQuery(sessionId));
      if (pet) {
        client.emit(WS_EVENTS.PET_UPDATE, pet);
      }
    }
  }

  handleDisconnect(client: Socket) {
    const sessionId = this.socketToSession.get(client.id);
    if (sessionId) {
      this.sessionToSocket.delete(sessionId);
      this.actionCooldowns.delete(sessionId);
      this.actionTimestamps.delete(sessionId);
    }
    this.socketToSession.delete(client.id);
  }

  @SubscribeMessage(WS_EVENTS.CREATE_PET)
  async handleCreatePet(@MessageBody() data: unknown, @ConnectedSocket() client: Socket) {
    const parsed = CreatePetDtoSchema.safeParse(data);
    if (!parsed.success) {
      client.emit(WS_EVENTS.ERROR, {
        message: 'Invalid create pet data',
        errors: parsed.error.flatten(),
      });
      return;
    }

    const sessionId = client.id; // Use socket id as session for new pets
    const pet = await this.commandBus.execute(
      new CreatePetCommand(sessionId, parsed.data.name, parsed.data.startingClass),
    );

    this.socketToSession.set(client.id, pet.id);
    this.sessionToSocket.set(pet.id, client.id);

    client.emit(WS_EVENTS.PET_UPDATE, pet.toPlain());
  }

  @SubscribeMessage(WS_EVENTS.FEED)
  async handleFeed(@ConnectedSocket() client: Socket) {
    await this.executeActionForClient(client, (sessionId) => new FeedCommand(sessionId), 'feed');
  }

  @SubscribeMessage(WS_EVENTS.PLAY)
  async handlePlay(@ConnectedSocket() client: Socket) {
    await this.executeActionForClient(client, (sessionId) => new PlayCommand(sessionId), 'play');
  }

  @SubscribeMessage(WS_EVENTS.SLEEP)
  async handleSleep(@ConnectedSocket() client: Socket) {
    await this.executeActionForClient(client, (sessionId) => new SleepCommand(sessionId), 'sleep');
  }

  @SubscribeMessage(WS_EVENTS.WAKE_UP)
  async handleWakeUp(@ConnectedSocket() client: Socket) {
    await this.executeActionForClient(
      client,
      (sessionId) => new WakeUpCommand(sessionId),
      'wakeUp',
    );
  }

  @SubscribeMessage(WS_EVENTS.CLEAN)
  async handleClean(@ConnectedSocket() client: Socket) {
    await this.executeActionForClient(client, (sessionId) => new CleanCommand(sessionId), 'clean');
  }

  @SubscribeMessage(WS_EVENTS.HEAL)
  async handleHeal(@ConnectedSocket() client: Socket) {
    await this.executeActionForClient(client, (sessionId) => new HealCommand(sessionId), 'heal');
  }

  private async executeActionForClient(
    client: Socket,
    commandFactory: (sessionId: string) => object,
    actionName?: string,
  ) {
    const sessionId = this.socketToSession.get(client.id);
    if (!sessionId) {
      client.emit(WS_EVENTS.ERROR, { message: 'No pet associated with this session' });
      return;
    }

    const now = Date.now();

    // Global rate limit check
    const timestamps = this.actionTimestamps.get(sessionId) ?? [];
    const recentTimestamps = timestamps.filter((t) => now - t < this.RATE_LIMIT_WINDOW_MS);
    if (recentTimestamps.length >= this.RATE_LIMIT_MAX_ACTIONS) {
      client.emit(WS_EVENTS.ERROR, { message: 'Too many actions. Please slow down.' });
      return;
    }

    // Per-action cooldown check
    if (actionName) {
      const cooldowns = this.actionCooldowns.get(sessionId) ?? new Map<string, number>();
      const lastUsed = cooldowns.get(actionName) ?? 0;
      const cooldownMs = this.COOLDOWN_MS[actionName] ?? 0;

      if (now - lastUsed < cooldownMs) {
        const remaining = Math.ceil((cooldownMs - (now - lastUsed)) / 1000);
        client.emit(WS_EVENTS.ERROR, {
          message: `${actionName} is on cooldown. Wait ${remaining}s.`,
        });
        return;
      }

      cooldowns.set(actionName, now);
      this.actionCooldowns.set(sessionId, cooldowns);
    }

    // Track for global rate limit
    recentTimestamps.push(now);
    this.actionTimestamps.set(sessionId, recentTimestamps);

    try {
      await this.commandBus.execute(commandFactory(sessionId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit(WS_EVENTS.ERROR, { message });
    }
  }

  // ─── Event Handlers → Push to clients ─────────────────────────

  @OnEvent('pet.created')
  handlePetCreatedEvent(event: PetCreatedEvent) {
    this.emitToSession(event.sessionId, WS_EVENTS.PET_UPDATE, event.pet);
  }

  @OnEvent('stat.changed')
  handleStatChangedEvent(event: StatChangedEvent) {
    this.emitToSession(event.sessionId, WS_EVENTS.PET_UPDATE, event.pet);
  }

  @OnEvent('state.transition')
  handleStateTransitionEvent(event: StateTransitionEvent) {
    this.emitToSession(event.sessionId, WS_EVENTS.STATE_TRANSITION, {
      petId: event.petId,
      fromState: event.fromState,
      toState: event.toState,
    });
  }

  @OnEvent('pet.died')
  handlePetDiedEvent(event: PetDiedEvent) {
    this.emitToSession(event.sessionId, WS_EVENTS.PET_DIED, {
      petId: event.petId,
      name: event.name,
      finalLevel: event.finalLevel,
      causeOfDeath: event.causeOfDeath,
    });
  }

  @OnEvent('pet.evolved')
  handlePetEvolvedEvent(event: PetEvolvedEvent) {
    this.emitToSession(event.sessionId, WS_EVENTS.PET_EVOLVED, {
      petId: event.petId,
      newLevel: event.newLevel,
      previousLevel: event.previousLevel,
    });
  }

  private emitToSession(sessionId: string, event: string, data: unknown) {
    const socketId = this.sessionToSocket.get(sessionId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
