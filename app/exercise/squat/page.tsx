import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function SquatPage() {
  return <Suspense><AIWorkoutSession slug="squat" /></Suspense>;
}
