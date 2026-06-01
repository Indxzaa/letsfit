'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { Exercise } from '@/lib/exercises';

type Props = {
  exercise: Exercise;
  onStart: (target: number) => void;
};

export default function TargetPicker({ exercise, onStart }: Props) {
  const [selected, setSelected] = useState<number>(exercise.defaultTarget);
  const [custom, setCustom] = useState<string>('');
  const isTimed = exercise.isTimed;
  const unit = isTimed ? 'sec' : 'reps';

  const handleStart = () => {
    const customNum = parseInt(custom, 10);
    const target = !isNaN(customNum) && customNum > 0 ? customNum : selected;
    onStart(target);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="surface rounded-2xl p-6 sm:p-8"
    >
      <div className="text-sm font-medium accent-text mb-2">Set your goal</div>
      <h2 className="text-xl sm:text-2xl font-semibold text-app mb-2">
        How many {isTimed ? 'seconds' : 'reps'}?
      </h2>
      <p className="text-sm text-muted mb-6">
        Pick a target. Your workout will automatically end when you reach it.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {exercise.targets.map((t) => (
          <button
            key={t}
            onClick={() => {
              setSelected(t);
              setCustom('');
            }}
            className={`p-4 rounded-xl border transition-all ${
              selected === t && !custom
                ? 'bg-[var(--accent)]/10 border-[var(--accent)]/40'
                : 'surface surface-hover'
            }`}
          >
            <div className="text-2xl font-semibold text-app tabular-nums">{t}</div>
            <div className="text-xs text-subtle mt-0.5">{unit}</div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-subtle">Or custom:</span>
        <input
          type="number"
          min={1}
          max={500}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={`e.g. ${exercise.defaultTarget}`}
          className="flex-1 px-3 py-2 rounded-lg surface text-sm focus:outline-none focus:border-[var(--accent)]"
        />
        <span className="text-xs text-subtle">{unit}</span>
      </div>

      <button
        onClick={handleStart}
        className="w-full px-5 py-3 rounded-lg accent-bg text-white text-sm font-medium flex items-center justify-center gap-2"
      >
        Start workout
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
