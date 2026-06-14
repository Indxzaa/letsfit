import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function DeadBugPage() {
  return <Suspense><AIWorkoutSession slug="dead-bug" /></Suspense>;
}
