import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function LungePage() {
  return <Suspense><AIWorkoutSession slug="lunge" /></Suspense>;
}
