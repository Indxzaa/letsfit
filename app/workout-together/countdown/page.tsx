'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

function CountdownContent() {
  const router = useRouter();
  const params = useSearchParams();
  const exercise = params.get('exercise') ?? 'squat';

  const [count, setCount] = useState<number | 'GO!'>(3);

  useEffect(() => {
    const steps: (number | 'GO!')[] = [3, 2, 1, 'GO!'];
    let i = 0;
    const tick = () => {
      i++;
      if (i < steps.length) {
        setCount(steps[i]);
        if (steps[i] === 'GO!') {
          setTimeout(() => router.push(`/workout-together/session?exercise=${exercise}`), 900);
        }
      }
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [exercise, router]);

  const isGo = count === 'GO!';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: isGo ? 'var(--neo-accent)' : 'var(--neo-black)' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={String(count)}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="text-center select-none"
        >
          <div
            className="font-display font-black leading-none"
            style={{
              fontSize: isGo ? 'clamp(5rem, 20vw, 10rem)' : 'clamp(8rem, 30vw, 16rem)',
              color: isGo ? '#fff' : 'var(--neo-accent)',
              letterSpacing: isGo ? '0.05em' : '-0.02em',
              textShadow: isGo ? 'none' : `6px 6px 0 rgba(34,197,94,0.2)`,
            }}
          >
            {count}
          </div>
          {!isGo && (
            <div
              className="font-display text-xl font-bold uppercase tracking-widest mt-4"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              Get Ready
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function CountdownPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#000' }} />}>
      <CountdownContent />
    </Suspense>
  );
}
