'use client';

import RequireAuth from '@/components/RequireAuth';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
