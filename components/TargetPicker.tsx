'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Target } from 'lucide-react';
import { useState } from 'react';
import type { Exercise } from '@/lib/exercises';

export default function TargetPicker({ exercise, onStart }: { exercise: Exercise; onStart: (t: number) => void }) {
  const [selected, setSelected] = useState(exercise.defaultTarget);
  const [custom, setCustom] = useState('');
  const isTimed = exercise.isTimed;
  const unit = isTimed ? 'sec' : 'reps';

  const handleStart = () => {
    const n = parseInt(custom, 10);
    onStart(!isNaN(n) && n > 0 ? n : selected);
  };

  const effectiveTarget = (() => {
    const n = parseInt(custom, 10);
    return !isNaN(n) && n > 0 ? n : selected;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="neo-card p-6 sm:p-8 flex flex-col h-full"
      style={{ background: 'var(--neo-surface)', borderRadius: 0 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-7 h-7 flex items-center justify-center neo-card-accent"
          style={{ borderRadius: 0 }}
        >
          <Target className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--neo-accent)' }}>
          Set your goal
        </span>
      </div>

      <h2 className="font-display text-xl sm:text-2xl font-bold text-app mb-1">
        How many {isTimed ? 'seconds' : 'reps'}?
      </h2>
      <p className="text-sm text-muted mb-6">Workout ends automatically when you hit the target.</p>

      {/* Preset targets */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {exercise.targets.map((t) => {
          const active = selected === t && !custom;
          return (
            <button
              key={t}
              onClick={() => { setSelected(t); setCustom(''); }}
              className="p-4 text-center cursor-pointer transition-all duration-100"
              style={{
                background: active ? 'var(--neo-accent)' : 'var(--neo-white)',
                border: 'var(--neo-border)',
                boxShadow: active ? 'var(--neo-shadow)' : 'var(--neo-shadow-sm)',
              }}
            >
              <span
                className="block text-2xl font-bold tabular-nums"
                style={{ color: active ? '#fff' : 'var(--neo-black)' }}
              >
                {t}
              </span>
              <span
                className="block text-xs mt-0.5 font-semibold uppercase tracking-wider"
                style={{ color: active ? 'rgba(255,255,255,0.75)' : 'var(--text-subtle)' }}
              >
                {unit}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 mb-6"
        style={{
          background: 'var(--neo-white)',
          border: 'var(--neo-border)',
        }}
      >
        <span className="text-xs font-bold uppercase tracking-wider text-subtle whitespace-nowrap">Custom:</span>
        <input
          type="number"
          min={1}
          max={500}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={`e.g. ${exercise.defaultTarget}`}
          className="flex-1 bg-transparent text-sm text-app focus:outline-none tabular-nums"
        />
        <span className="text-xs font-semibold text-subtle">{unit}</span>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle">Target</span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: 'var(--neo-accent)' }}
          >
            {effectiveTarget} {unit}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="neo-btn neo-btn-primary w-full justify-center"
        >
          Start workout
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
