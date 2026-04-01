import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { gameConfig } from './config/game.config';

// Application layer
import {
  CreatePetHandler,
  FeedHandler,
  PlayHandler,
  SleepHandler,
  WakeUpHandler,
  CleanHandler,
  HealHandler,
  TickHandler,
} from './application/commands';
import { GetPetHandler, GetGraveyardHandler } from './application/queries';

// Infrastructure layer
import { RedisPetStateAdapter } from './infrastructure/redis';
import { DrizzleGraveyardAdapter } from './infrastructure/drizzle';
import { BullMQTickProcessor } from './infrastructure/bullmq';
import { PetGateway } from './infrastructure/ws';

// Web layer
import { GraveyardController } from './web/graveyard.controller';
import { GlobalExceptionFilter } from './web/global-exception.filter';

// Ports
import { PET_STATE_PORT } from './application/ports/pet-state.port';
import { PET_GRAVEYARD_PORT } from './application/ports/pet-graveyard.port';
import { TICK_SCHEDULER_PORT } from './application/ports/tick-scheduler.port';

const CommandHandlers = [
  CreatePetHandler,
  FeedHandler,
  PlayHandler,
  SleepHandler,
  WakeUpHandler,
  CleanHandler,
  HealHandler,
  TickHandler,
];

const QueryHandlers = [GetPetHandler, GetGraveyardHandler];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gameConfig],
    }),
    CqrsModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [GraveyardController],
  providers: [
    // CQRS handlers
    ...CommandHandlers,
    ...QueryHandlers,

    // Infrastructure adapters bound to ports
    { provide: PET_STATE_PORT, useClass: RedisPetStateAdapter },
    { provide: PET_GRAVEYARD_PORT, useClass: DrizzleGraveyardAdapter },
    { provide: TICK_SCHEDULER_PORT, useClass: BullMQTickProcessor },

    // WebSocket gateway
    PetGateway,

    // Global exception filter
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
