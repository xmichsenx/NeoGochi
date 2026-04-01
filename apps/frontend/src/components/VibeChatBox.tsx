'use client';

import type { PetState, PetStats } from '@neogochi/shared';

interface VibeChatBoxProps {
  state: PetState;
  stats: PetStats;
  name: string;
}

function getDialogue(state: PetState, stats: PetStats, name: string): string {
  if (state === 'Dead') return `${name} has passed away...`;
  if (state === 'Sleeping') return 'Zzz... Zzz...';
  if (state === 'Sick') return "I don't feel so good...";
  if (state === 'Eating') return 'Om nom nom!';
  if (state === 'Playing') return 'Wheee! This is fun!';
  if (state === 'Evolution') return "I'm... evolving!";

  // Idle with stat-based dialogue
  if (stats.hunger < 20) return "I'm starving... need food!";
  if (stats.happiness < 20) return "I'm so bored...";
  if (stats.energy < 20) return 'So... tired...';
  if (stats.cleanliness < 20) return 'I need a bath!';
  if (stats.health < 30) return 'I feel weak...';

  if (stats.happiness > 80 && stats.hunger > 60) return 'Life is great! ✨';
  if (stats.energy > 80) return "I'm full of energy!";

  return "Hey there! I'm doing okay.";
}

export function VibeChatBox({ state, stats, name }: VibeChatBoxProps) {
  const dialogue = getDialogue(state, stats, name);

  return (
    <div className="bg-neogochi-card border border-neogochi-secondary rounded-lg p-4 max-w-xs">
      <div className="relative">
        <p className="text-[10px] leading-relaxed">{dialogue}</p>
        <div className="absolute -top-6 left-4 w-3 h-3 bg-neogochi-card border-l border-t border-neogochi-secondary rotate-45" />
      </div>
    </div>
  );
}
