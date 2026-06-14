import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function WallSitPage() {
  return <Suspense><AIWorkoutSession slug="wall-sit" /></Suspense>;
}
