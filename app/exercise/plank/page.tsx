import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function PlankPage() {
  return <Suspense><AIWorkoutSession slug="plank" /></Suspense>;
}
