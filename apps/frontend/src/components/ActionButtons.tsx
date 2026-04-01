'use client';

import type { PetState } from '@neogochi/shared';

interface ActionButtonsProps {
  currentState: PetState;
  onFeed: () => void;
  onPlay: () => void;
  onSleep: () => void;
  onWakeUp: () => void;
  onClean: () => void;
  onHeal: () => void;
}

interface Action {
  label: string;
  emoji: string;
  onClick: () => void;
  enabled: (state: PetState) => boolean;
}

export function ActionButtons({
  currentState,
  onFeed,
  onPlay,
  onSleep,
  onWakeUp,
  onClean,
  onHeal,
}: ActionButtonsProps) {
  const actions: Action[] = [
    { label: 'Feed', emoji: '🍖', onClick: onFeed, enabled: (s) => s === 'Idle' },
    { label: 'Play', emoji: '⚽', onClick: onPlay, enabled: (s) => s === 'Idle' },
    { label: 'Sleep', emoji: '😴', onClick: onSleep, enabled: (s) => s === 'Idle' },
    { label: 'Wake', emoji: '⏰', onClick: onWakeUp, enabled: (s) => s === 'Sleeping' },
    { label: 'Clean', emoji: '🧼', onClick: onClean, enabled: (s) => s === 'Idle' || s === 'Sick' },
    { label: 'Heal', emoji: '💊', onClick: onHeal, enabled: (s) => s === 'Sick' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => {
        const isEnabled = action.enabled(currentState);
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={!isEnabled}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-lg text-xs transition-all
              ${
                isEnabled
                  ? 'bg-neogochi-secondary hover:bg-neogochi-accent hover:scale-105 cursor-pointer'
                  : 'bg-neogochi-card opacity-40 cursor-not-allowed'
              }
            `}
          >
            <span className="text-2xl">{action.emoji}</span>
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
