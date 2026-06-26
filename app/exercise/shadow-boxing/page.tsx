import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function Page() {
  return <Suspense><AIWorkoutSession slug="shadow-boxing" /></Suspense>;
}
