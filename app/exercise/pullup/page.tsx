import { Suspense } from 'react';
import ManualWorkoutSession from '@/components/ManualWorkoutSession';
export default function PullupPage() {
  return <Suspense><ManualWorkoutSession slug="pullup" /></Suspense>;
}
