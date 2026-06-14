import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function MountainClimberPage() {
  return <Suspense><AIWorkoutSession slug="mountain-climber" /></Suspense>;
}
