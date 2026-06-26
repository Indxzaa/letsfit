import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function Page() {
  return <Suspense><AIWorkoutSession slug="arm-circles" /></Suspense>;
}
