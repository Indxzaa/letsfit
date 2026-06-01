'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

/**
 * Client-side route guard.
 *
 * Behaviour:
 * - While the auth state is loading, renders a centered spinner.
 * - If Supabase is configured but no user is signed in, redirects to /signin
 *   with a `next` query param so we can return after login.
 * - If Supabase is NOT configured (no .env.local yet), renders children
 *   anyway so the rest of the app stays usable in dev. Auth-only features
 *   that require a real user will surface their own warnings.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user) {
      const next = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/signin?next=${next}`);
    }
  }, [loading, user, configured, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted" />
      </div>
    );
  }

  if (configured && !user) {
    // While the redirect is in flight, render nothing rather than a flash
    // of protected content.
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted" />
      </div>
    );
  }

  return <>{children}</>;
}
