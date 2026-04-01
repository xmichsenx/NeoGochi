'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { usePetState } from '@/hooks/usePetState';
import { PetSprite } from '@/components/PetSprite';
import { StatBar } from '@/components/StatBar';
import { ActionButtons } from '@/components/ActionButtons';
import { VibeChatBox } from '@/components/VibeChatBox';

const statColors: Record<string, string> = {
  hunger: '#f59e0b',
  happiness: '#ec4899',
  energy: '#3b82f6',
  health: '#22c55e',
  cleanliness: '#06b6d4',
};

export default function LivingRoomPage() {
  const router = useRouter();
  const pet = usePetState((s) => s.pet);
  const error = usePetState((s) => s.error);
  const { feed, play, sleep, wakeUp, clean, heal } = useSocket();

  useEffect(() => {
    if (!pet) {
      router.push('/');
    }
  }, [pet, router]);

  if (!pet) return null;

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-sm text-neogochi-accent">NeoGochi</h1>
        <div className="text-[10px] text-neogochi-muted">
          Lv.{pet.level} • XP: {pet.xp}
        </div>
      </div>

      {/* Pet Sprite */}
      <div className="flex-1 flex items-center justify-center py-8">
        <PetSprite state={pet.currentState} name={pet.name} />
      </div>

      {/* Vibe Chat */}
      <VibeChatBox state={pet.currentState} stats={pet.stats} name={pet.name} />

      {/* Stats HUD */}
      <div className="flex gap-4 justify-center flex-wrap">
        {Object.entries(pet.stats).map(([key, value]) => (
          <StatBar key={key} label={key} value={value} color={statColors[key] ?? '#888'} />
        ))}
      </div>

      {/* Action Buttons */}
      <ActionButtons
        currentState={pet.currentState}
        onFeed={feed}
        onPlay={play}
        onSleep={sleep}
        onWakeUp={wakeUp}
        onClean={clean}
        onHeal={heal}
      />

      {/* Error display */}
      {error && <div className="text-[10px] text-red-400 bg-red-900/20 rounded p-2">{error}</div>}

      {/* Graveyard link */}
      <a
        href="/graveyard"
        className="text-[8px] text-neogochi-muted hover:text-neogochi-accent transition-colors"
      >
        Visit the Graveyard →
      </a>
    </main>
  );
}
