'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { usePetState } from '@/hooks/usePetState';
import type { StartingClass } from '@neogochi/shared';

const classes: { value: StartingClass; emoji: string; desc: string }[] = [
  { value: 'Aggressive', emoji: '🔥', desc: 'High energy, fierce' },
  { value: 'Chill', emoji: '😎', desc: 'Balanced, easygoing' },
  { value: 'Intellectual', emoji: '🧠', desc: 'Curious, needs stimulation' },
];

export default function HatcheryPage() {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<StartingClass | null>(null);
  const [isHatching, setIsHatching] = useState(false);
  const router = useRouter();
  const { createPet } = useSocket();
  const pet = usePetState((s) => s.pet);

  // Redirect if pet already exists
  if (pet) {
    router.push('/pet');
    return null;
  }

  const handleHatch = () => {
    if (!name.trim() || !selectedClass) return;
    setIsHatching(true);
    createPet({ name: name.trim(), startingClass: selectedClass });
    // The useSocket hook will update pet state, then we redirect
    setTimeout(() => router.push('/pet'), 1500);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <motion.h1
        className="text-2xl text-neogochi-accent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        NeoGochi
      </motion.h1>

      <motion.div
        className="text-[80px] cursor-pointer select-none"
        whileHover={{ rotate: [-5, 5, -5, 5, 0], transition: { duration: 0.5 } }}
        animate={
          isHatching
            ? { scale: [1, 1.1, 1.2, 0], rotate: [0, 10, -10, 0], transition: { duration: 1.5 } }
            : {}
        }
      >
        🥚
      </motion.div>

      {!isHatching && (
        <motion.div
          className="flex flex-col items-center gap-6 w-full max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your pet..."
            maxLength={30}
            className="w-full bg-neogochi-card border border-neogochi-secondary rounded-lg p-3 text-center text-xs text-neogochi-text placeholder:text-neogochi-muted outline-none focus:border-neogochi-accent transition-colors"
          />

          <div className="grid grid-cols-3 gap-3 w-full">
            {classes.map((cls) => (
              <button
                key={cls.value}
                onClick={() => setSelectedClass(cls.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg text-xs transition-all ${
                  selectedClass === cls.value
                    ? 'bg-neogochi-accent scale-105'
                    : 'bg-neogochi-secondary hover:bg-neogochi-card'
                }`}
              >
                <span className="text-3xl">{cls.emoji}</span>
                <span>{cls.value}</span>
                <span className="text-[8px] text-neogochi-muted">{cls.desc}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleHatch}
            disabled={!name.trim() || !selectedClass}
            className={`w-full p-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              name.trim() && selectedClass
                ? 'bg-neogochi-accent hover:scale-105 cursor-pointer'
                : 'bg-neogochi-card opacity-40 cursor-not-allowed'
            }`}
          >
            Hatch! 🐣
          </button>
        </motion.div>
      )}
    </main>
  );
}
