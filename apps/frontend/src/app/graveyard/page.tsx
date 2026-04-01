'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { GraveyardEntry } from '@neogochi/shared';
import { PetSprite } from '@/components/PetSprite';

export default function GraveyardPage() {
  const [entries, setEntries] = useState<GraveyardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 10;

  useEffect(() => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    fetch(`${apiUrl}/graveyard?page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-8">
      <h1 className="text-xl text-neogochi-accent">⚰️ Graveyard</h1>
      <p className="text-[10px] text-neogochi-muted">In memory of fallen companions</p>

      {loading ? (
        <p className="text-neogochi-muted text-xs">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-neogochi-muted text-xs mt-10">No fallen pets yet. Stay strong!</p>
      ) : (
        <div className="w-full max-w-md space-y-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-neogochi-card border border-neogochi-secondary rounded-lg p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center opacity-40">
                  <PetSprite petId={entry.id} state="Dead" name="" level={entry.finalLevel} />
                </div>
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold">🪦 {entry.name}</p>
                    <p className="text-[8px] text-neogochi-muted mt-1">
                      {entry.startingClass} • Level {entry.finalLevel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-neogochi-muted">
                      {entry.daysSurvived.toFixed(1)} days
                    </p>
                    <p className="text-[8px] text-red-400 mt-1">{entry.causeOfDeath}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-[10px] text-neogochi-muted disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-[10px] text-neogochi-muted">
            {page}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-[10px] text-neogochi-muted disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      <a
        href="/"
        className="text-[8px] text-neogochi-muted hover:text-neogochi-accent transition-colors mt-4"
      >
        ← Back to Hatchery
      </a>
    </main>
  );
}
