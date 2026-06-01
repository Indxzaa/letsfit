'use client';

import RequireAuth from '@/components/RequireAuth';

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
