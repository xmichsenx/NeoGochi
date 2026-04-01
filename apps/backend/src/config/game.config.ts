import { registerAs } from '@nestjs/config';

export const gameConfig = registerAs('game', () => ({
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  postgres: {
    url: process.env.DATABASE_URL ?? 'postgres://neogochi:neogochi@localhost:5432/neogochi',
  },
  tick: {
    intervalMs: parseInt(process.env.TICK_INTERVAL_MS ?? '30000', 10),
  },
  statDecay: {
    hunger: parseFloat(process.env.DECAY_HUNGER ?? '3'),
    happiness: parseFloat(process.env.DECAY_HAPPINESS ?? '2'),
    energy: parseFloat(process.env.DECAY_ENERGY ?? '2'),
    health: parseFloat(process.env.DECAY_HEALTH ?? '1'),
    cleanliness: parseFloat(process.env.DECAY_CLEANLINESS ?? '2'),
  },
}));

export type GameConfig = ReturnType<typeof gameConfig>;
