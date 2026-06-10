'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
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

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setSession(data.session);
      setUser(u);
      setLoading(false);
      if (u) applyUserSideEffects(u);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
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
