'use client';

import { motion } from 'framer-motion';
import type { PetState } from '@neogochi/shared';

interface PetSpriteProps {
  state: PetState;
  name: string;
}

const stateAnimations: Record<PetState, object> = {
  Idle: {
    y: [0, -4, 0],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
  Eating: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 0.5 },
  },
  Playing: {
    rotate: [-5, 5, -5],
    transition: { repeat: Infinity, duration: 0.3 },
  },
  Sleeping: {
    opacity: [1, 0.7, 1],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  Sick: {
    x: [-2, 2, -2],
    transition: { repeat: Infinity, duration: 0.2 },
  },
  Evolution: {
    scale: [1, 1.3, 1],
    rotate: [0, 360],
    transition: { duration: 1 },
  },
  Dead: {
    opacity: 0.3,
    rotate: 90,
  },
};

const stateEmojis: Record<PetState, string> = {
  Idle: '🐾',
  Eating: '🍖',
  Playing: '⚽',
  Sleeping: '💤',
  Sick: '🤒',
  Evolution: '✨',
  Dead: '💀',
};

export function PetSprite({ state, name }: PetSpriteProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div className="text-8xl select-none" animate={stateAnimations[state]} key={state}>
        {stateEmojis[state]}
      </motion.div>
      <p className="text-neogochi-muted text-xs">{name}</p>
      <p className="text-neogochi-accent text-[10px] uppercase tracking-wider">{state}</p>
    </div>
  );
}
