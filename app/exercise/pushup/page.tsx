import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function PushupPage() {
  return <Suspense><AIWorkoutSession slug="pushup" /></Suspense>;
}
