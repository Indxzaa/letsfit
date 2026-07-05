'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { MULTIPLAYER_EXERCISES } from '@/lib/multiplayer/constants';

export default function ExerciseSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleStart = () => {
    if (!selected) return;
    router.push(`/workout-together/countdown?exercise=${selected}`);
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        <Link href="/workout-together/lobby?mode=create" className="link-back mb-10 inline-flex cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Lobby
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="mb-8">
            <div className="neo-badge mb-4 w-fit">Host · Choose Exercise</div>
            <h1 className="font-display text-4xl font-bold text-app uppercase mb-2">
              Pick an Exercise
            </h1>
            <p className="text-muted text-sm">Select the exercise both players will do together.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {MULTIPLAYER_EXERCISES.map((ex, i) => {
              const isSelected = selected === ex.slug;
              return (
                <motion.button
                  key={ex.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ y: 2, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30, opacity: { duration: 0.28 }, y: { duration: 0.28, delay: i * 0.05 } }}
                  onClick={() => setSelected(ex.slug)}
                  className="neo-card p-6 text-left cursor-pointer flex flex-col gap-3"
                  style={{
                    background: isSelected ? 'var(--neo-accent)' : ex.cardBg,
                    borderRadius: 0,
                    borderColor: isSelected ? 'var(--neo-black)' : undefined,
                    boxShadow: isSelected ? 'var(--neo-shadow-lg)' : 'var(--neo-shadow)',
                  }}
                >
                  <span className="text-4xl">{ex.emoji}</span>
                  <div>
                    <div className={`font-display text-lg font-bold uppercase ${isSelected ? 'text-white' : 'text-app'}`}>
                      {ex.name}
                    </div>
                    {isSelected && (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/80 mt-1">
                        Selected ✓
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            whileHover={selected ? { y: -3 } : undefined}
            whileTap={selected ? { y: 2, scale: 0.985 } : undefined}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={handleStart}
            disabled={!selected}
            className="w-full py-4 font-display font-black uppercase tracking-wider text-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              background: 'var(--neo-accent)',
              border: 'var(--neo-border)',
              boxShadow: selected ? 'var(--neo-shadow-lg)' : 'none',
              color: '#fff',
              borderRadius: 0,
            }}
          >
            Start Countdown <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
