import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function PullupPage() {
  return <Suspense><AIWorkoutSession slug="pullup" /></Suspense>;
}
