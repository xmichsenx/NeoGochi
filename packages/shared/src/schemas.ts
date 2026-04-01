import { z } from 'zod';

// ─── Pet State Enum ─────────────────────────────────────────────
export const PetStateEnum = z.enum([
  'Idle',
  'Eating',
  'Playing',
  'Sleeping',
  'Sick',
  'Evolution',
  'Dead',
]);
export type PetState = z.infer<typeof PetStateEnum>;

// ─── Starting Class Enum ────────────────────────────────────────
export const StartingClassEnum = z.enum(['Aggressive', 'Chill', 'Intellectual']);
export type StartingClass = z.infer<typeof StartingClassEnum>;

// ─── Pet Stats ──────────────────────────────────────────────────
export const PetStatsSchema = z.object({
  hunger: z.number().min(0).max(100),
  happiness: z.number().min(0).max(100),
  energy: z.number().min(0).max(100),
  health: z.number().min(0).max(100),
  cleanliness: z.number().min(0).max(100),
});
export type PetStats = z.infer<typeof PetStatsSchema>;

// ─── Pet Schema (full state) ────────────────────────────────────
export const PetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(30),
  startingClass: StartingClassEnum,
  stats: PetStatsSchema,
  currentState: PetStateEnum,
  xp: z.number().min(0),
  level: z.number().min(1),
  createdAt: z.string().datetime(),
});
export type Pet = z.infer<typeof PetSchema>;

// ─── Action DTOs ────────────────────────────────────────────────
export const CreatePetDtoSchema = z.object({
  name: z.string().min(1).max(30),
  startingClass: StartingClassEnum,
});
export type CreatePetDto = z.infer<typeof CreatePetDtoSchema>;

export const PetActionDtoSchema = z.object({
  petId: z.string().uuid(),
});
export type PetActionDto = z.infer<typeof PetActionDtoSchema>;

// ─── WebSocket Event Payloads ───────────────────────────────────
export const PetUpdatePayloadSchema = PetSchema;
export type PetUpdatePayload = z.infer<typeof PetUpdatePayloadSchema>;

export const StateTransitionPayloadSchema = z.object({
  petId: z.string().uuid(),
  fromState: PetStateEnum,
  toState: PetStateEnum,
});
export type StateTransitionPayload = z.infer<typeof StateTransitionPayloadSchema>;

export const PetDiedPayloadSchema = z.object({
  petId: z.string().uuid(),
  name: z.string(),
  finalLevel: z.number(),
  causeOfDeath: z.string(),
});
export type PetDiedPayload = z.infer<typeof PetDiedPayloadSchema>;

export const PetEvolvedPayloadSchema = z.object({
  petId: z.string().uuid(),
  newLevel: z.number(),
  previousLevel: z.number(),
});
export type PetEvolvedPayload = z.infer<typeof PetEvolvedPayloadSchema>;

// ─── Starting Class Config ──────────────────────────────────────
export interface ClassConfig {
  name: StartingClass;
  description: string;
  statWeights: {
    hungerDecayRate: number;
    happinessDecayRate: number;
    energyDecayRate: number;
    healthDecayRate: number;
    cleanlinessDecayRate: number;
  };
  initialStats: PetStats;
}

export const CLASS_CONFIGS: Record<StartingClass, ClassConfig> = {
  Aggressive: {
    name: 'Aggressive',
    description: 'High energy, quick to anger, decays happiness faster',
    statWeights: {
      hungerDecayRate: 2,
      happinessDecayRate: 3,
      energyDecayRate: 1,
      healthDecayRate: 1.5,
      cleanlinessDecayRate: 2,
    },
    initialStats: {
      hunger: 80,
      happiness: 60,
      energy: 100,
      health: 90,
      cleanliness: 70,
    },
  },
  Chill: {
    name: 'Chill',
    description: 'Balanced and easygoing, slower overall decay',
    statWeights: {
      hungerDecayRate: 1.5,
      happinessDecayRate: 1,
      energyDecayRate: 1.5,
      healthDecayRate: 1,
      cleanlinessDecayRate: 1.5,
    },
    initialStats: {
      hunger: 80,
      happiness: 90,
      energy: 70,
      health: 85,
      cleanliness: 80,
    },
  },
  Intellectual: {
    name: 'Intellectual',
    description: 'Curious mind, needs more stimulation, energy drains faster',
    statWeights: {
      hungerDecayRate: 1,
      happinessDecayRate: 2,
      energyDecayRate: 2.5,
      healthDecayRate: 1,
      cleanlinessDecayRate: 1,
    },
    initialStats: {
      hunger: 70,
      happiness: 75,
      energy: 60,
      health: 95,
      cleanliness: 85,
    },
  },
};

// ─── Graveyard Entry ────────────────────────────────────────────
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

// ─── WebSocket Event Names ──────────────────────────────────────
export const WS_EVENTS = {
  // Client → Server
  CREATE_PET: 'createPet',
  FEED: 'feed',
  PLAY: 'play',
  SLEEP: 'sleep',
  WAKE_UP: 'wakeUp',
  CLEAN: 'clean',
  HEAL: 'heal',

  // Server → Client
  PET_UPDATE: 'petUpdate',
  STATE_TRANSITION: 'stateTransition',
  PET_DIED: 'petDied',
  PET_EVOLVED: 'petEvolved',
  ERROR: 'error',
} as const;

// ─── Evolution Thresholds ───────────────────────────────────────
export const EVOLUTION_LEVELS = [5, 15, 30] as const;

export const XP_PER_ACTION = {
  feed: 5,
  play: 10,
  clean: 3,
  heal: 7,
  sleep: 2,
} as const;
