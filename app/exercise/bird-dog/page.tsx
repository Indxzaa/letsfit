import { Suspense } from 'react';
import AIWorkoutSession from '@/components/AIWorkoutSession';
export default function BirdDogPage() {
  return <Suspense><AIWorkoutSession slug="bird-dog" /></Suspense>;
}
