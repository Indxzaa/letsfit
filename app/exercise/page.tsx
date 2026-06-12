'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { EXERCISES } from '@/lib/exercises';
import Navbar from '@/components/Navbar';

export default function ExerciseSelectPage() {
  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-8 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              color: 'var(--accent)',
            }}>
            Workout Catalog
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-app mb-3 leading-tight">
            Choose your mission.
          </h1>
          <p className="text-xl text-muted max-w-xl">
            Pick an exercise, set a target, start a session. Every rep earns XP.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EXERCISES.map((exercise, i) => (
            <motion.div
              key={exercise.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <Link href={`/exercise/${exercise.slug}`} className="block h-full cursor-pointer">
                <div
                  className="h-full flex flex-col hover:scale-[1.02] transition-transform duration-200 overflow-hidden"
                  style={{
                    borderRadius: 24,
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Colorful card header */}
                  <div className="p-6 pb-4" style={{
                    background: 'color-mix(in srgb, var(--accent) 12%, var(--surface-solid))',
                    borderBottom: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                  }}>
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'var(--accent)',
                          boxShadow: '0 6px 16px color-mix(in srgb, var(--accent) 45%, transparent)',
                        }}>
                        <exercise.icon className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                      {exercise.hasAiDetection && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                          style={{
                            background: 'var(--accent)',
                            color: '#fff',
                            boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 40%, transparent)',
                          }}>
                          <Sparkles className="w-3 h-3" />
                          AI
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-subtle mb-1">{exercise.tagline}</div>
                    <h3 className="font-display text-2xl font-bold text-app mb-2">{exercise.name}</h3>
                    <p className="text-sm text-muted leading-relaxed mb-5 flex-1">{exercise.description}</p>

                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      {[exercise.difficulty, exercise.duration, exercise.equipment].map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: 'color-mix(in srgb, var(--accent) 10%, var(--surface-solid))',
                            color: 'var(--text-muted)',
                            border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                          }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm font-bold"
                      style={{ color: 'var(--accent)' }}>
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
