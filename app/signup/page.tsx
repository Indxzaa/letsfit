import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app" />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
