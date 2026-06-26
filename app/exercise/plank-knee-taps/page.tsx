import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function Page() {
  return <Suspense><AIWorkoutSession slug="plank-knee-taps" /></Suspense>;
}
