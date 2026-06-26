'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { EXERCISES, type Exercise } from '@/lib/exercises';
import Navbar from '@/components/Navbar';

const CATEGORIES = ['All', 'Lower Body', 'Upper Body', 'Core / Stability', 'Cardio'] as const;
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

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

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              color: 'var(--accent)',
            }}>
            Workout Catalog
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-app mb-4 leading-tight">
            Choose your mission.
          </h1>
          <p className="text-xl text-muted max-w-xl">
            Pick an exercise, set a target, start a session. Every rep earns XP.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                style={cat === c
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--surface-solid)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDiff(d)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                style={diff === d
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--surface-solid)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted text-sm">No exercises match these filters.</div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((exercise, i) => (
            <motion.div key={exercise.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}>
              <Link href={`/exercise/${exercise.slug}`} className="block h-full cursor-pointer">
                <div className="h-full flex flex-col hover:scale-[1.02] transition-transform duration-200 overflow-hidden"
                  style={{
                    borderRadius: 24,
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}>
                  {/* Card header */}
                  <div className="p-6" style={{
                    background: 'color-mix(in srgb, var(--accent) 12%, var(--surface-solid))',
                    borderBottom: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                  }}>
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: 'var(--accent)', boxShadow: '0 6px 16px color-mix(in srgb, var(--accent) 45%, transparent)' }}>
                        <exercise.icon className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {exercise.hasAiDetection && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ background: 'var(--accent)', color: '#fff' }}>
                            <Sparkles className="w-3 h-3" /> AI
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-display text-2xl font-bold text-app mb-1">{exercise.name}</h3>
                    <div className="text-xs font-semibold text-subtle mb-4">{exercise.category}</div>

                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: 'color-mix(in srgb, var(--accent) 12%, var(--surface-solid))',
                          color: 'var(--accent)',
                          border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                        }}>
                        {exercise.difficulty}
                      </span>
                      {exercise.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                          style={{
                            background: 'var(--surface)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                          }}>
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
          ))}
        </div>
      </div>
    </div>
  );
}
