'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { EXERCISES, type Exercise } from '@/lib/exercises';
import Navbar from '@/components/Navbar';

const CATEGORIES = ['All', 'Lower Body', 'Upper Body', 'Core / Stability', 'Cardio'] as const;
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

const CARD_COLORS = [
  'var(--card-bg-green)',
  'var(--card-bg-amber)',
  'var(--card-bg-purple)',
  'var(--card-bg-blue)',
];

export default function ExerciseSelectPage() {
  const [cat, setCat] = useState<Exercise['category'] | 'All'>('All');
  const [diff, setDiff] = useState<Exercise['difficulty'] | 'All'>('All');

  const filtered = EXERCISES.filter(e =>
    (cat === 'All' || e.category === cat) &&
    (diff === 'All' || e.difficulty === diff)
  );

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Link href="/" className="link-back mb-10 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="neo-badge mb-5">
            Workout Catalog
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-app mb-4 leading-tight">
            Choose your mission.
          </h1>
          <p className="text-xl text-muted max-w-xl">
            Pick an exercise, set a target, start a session. Every rep earns XP and Fitcoins.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-10">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-100"
                style={cat === c
                  ? {
                      background: 'var(--neo-accent)',
                      color: '#fff',
                      border: 'var(--neo-border)',
                      boxShadow: 'var(--neo-shadow-sm)',
                    }
                  : {
                      background: 'var(--neo-white)',
                      color: 'var(--neo-black)',
                      border: 'var(--neo-border)',
                      boxShadow: 'var(--neo-shadow-sm)',
                    }
                }
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-100"
                style={diff === d
                  ? {
                      background: 'var(--neo-accent)',
                      color: '#fff',
                      border: 'var(--neo-border)',
                      boxShadow: 'var(--neo-shadow-sm)',
                    }
                  : {
                      background: 'var(--neo-white)',
                      color: 'var(--neo-black)',
                      border: 'var(--neo-border)',
                      boxShadow: 'var(--neo-shadow-sm)',
                    }
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted text-sm">No exercises match these filters.</div>
        )}

        {/* Exercise grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((exercise, i) => {
            const cardBg = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <motion.div
                key={exercise.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link href={`/exercise/${exercise.slug}`} className="block h-full cursor-pointer">
                  <div
                    className="h-full flex flex-col neo-card hover:scale-[1.02] transition-transform duration-150 overflow-hidden"
                    style={{ borderRadius: 0, background: cardBg }}
                  >
                    {/* Card header */}
                    <div
                      className="p-5"
                      style={{
                        borderBottom: 'var(--neo-border-2)',
                        background: 'color-mix(in srgb, var(--neo-black) 6%, ' + cardBg + ')',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="w-12 h-12 flex items-center justify-center neo-card-accent"
                          style={{ borderRadius: 0 }}
                        >
                          <exercise.icon className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        {exercise.hasAiDetection && (
                          <div
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold neo-card-accent"
                            style={{ borderRadius: 0 }}
                          >
                            <Sparkles className="w-3 h-3" /> AI
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-display text-xl font-bold text-app mb-0.5">{exercise.name}</h3>
                      <div className="text-xs font-semibold text-subtle mb-4 uppercase tracking-wider">{exercise.category}</div>

                      <div className="flex items-center gap-2 mb-5 flex-wrap">
                        <span
                          className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                          style={{
                            background: 'var(--neo-accent)',
                            color: '#fff',
                            border: 'var(--neo-border-2)',
                          }}
                        >
                          {exercise.difficulty}
                        </span>
                        {exercise.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 text-xs font-medium capitalize"
                            style={{
                              background: 'var(--neo-white)',
                              color: 'var(--neo-black)',
                              border: 'var(--neo-border-2)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto link-cta">
                        <span>Start session</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
