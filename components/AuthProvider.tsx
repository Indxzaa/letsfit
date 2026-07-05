'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, clearCorruptedSession } from '@/lib/supabase';
import { startSync, stopSync } from '@/lib/profileSync';
import { loadProgress, saveProgress } from '@/lib/progress';
import { isDevEmail, applyDevAccount } from '@/lib/devAccount';

type AuthResult = { error: string | null };

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  isDev: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, username: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function errorMessage(err: AuthError | null): string | null {
  return err ? err.message : null;
}

/** Returns true for any Supabase error that indicates the refresh token is gone or invalid. */
function isRefreshTokenError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('Refresh Token Not Found') ||
    msg.includes('Invalid Refresh Token') ||
    msg.includes('refresh_token_not_found') ||
    msg.includes('Token has expired or is not valid')
  );
}

function applyUserSideEffects(u: User) {
  startSync(u.id);
  if (isDevEmail(u.email)) {
    const current = loadProgress();
    const updated = applyDevAccount(current);
    saveProgress(updated);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Prevents re-entrant recovery calls if the listener fires multiple times
  const recoveringRef = useRef(false);

  /** Clear corrupted storage, sign out, and send the user to /signin. */
  const recoverFromBadSession = async () => {
    if (recoveringRef.current) return;
    recoveringRef.current = true;

    if (process.env.NODE_ENV === 'development') {
      console.warn('[auth] Invalid refresh token detected — clearing session and redirecting to /signin.');
    }

    clearCorruptedSession();

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // signOut may itself fail if the session is already gone — that is fine
      }
    }

    stopSync();
    setUser(null);
    setSession(null);
    setLoading(false);

    // Hard redirect so all in-memory state is wiped
    if (typeof window !== 'undefined') {
      window.location.replace('/signin');
    }
  };

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }

    // Initial session load — may throw if stored token is already invalid
    supabase.auth.getSession().then(({ data, error }) => {
      if (error && isRefreshTokenError(error)) {
        recoverFromBadSession();
        return;
      }
      const u = data.session?.user ?? null;
      setSession(data.session);
      setUser(u);
      setLoading(false);
      if (u) applyUserSideEffects(u);
    }).catch((err: unknown) => {
      if (isRefreshTokenError(err)) {
        recoverFromBadSession();
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      const u = s?.user ?? null;
      setSession(s);
      setUser(u);
      if (u) {
        applyUserSideEffects(u);
      } else {
        stopSync();
      }
    });

    return () => sub.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Authentication is not configured.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: errorMessage(error) };
  };

  const signUp = async (email: string, password: string, username: string): Promise<AuthResult> => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Authentication is not configured.' };
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    return { error: errorMessage(error) };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    stopSync();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, configured: isSupabaseConfigured, isDev: isDevEmail(user?.email), signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
