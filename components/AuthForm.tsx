'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Activity,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

type Mode = 'signin' | 'signup';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '/dashboard';
  const { signIn, signUp, configured } = useAuth();
  const isSignup = mode === 'signup';

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!email.trim()) return 'Email is required.';
    if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
    if (isSignup) {
      if (!username.trim()) return 'Choose a username.';
      if (!USERNAME_RE.test(username.trim()))
        return 'Username must be 3–20 characters, letters/numbers/underscore.';
    }
    if (!password) return 'Password is required.';
    if (isSignup && password.length < 6)
      return 'Password must be at least 6 characters.';
    if (isSignup && password !== confirmPassword)
      return 'Passwords do not match.';
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!configured) {
      setError(
        'Authentication is not configured. See SUPABASE_SETUP.md to add your keys.'
      );
      return;
    }

    const issue = validate();
    if (issue) {
      setError(issue);
      return;
    }

    setLoading(true);
    const result = isSignup
      ? await signUp(email.trim(), password, username.trim())
      : await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (isSignup) {
      setSuccess(
        'Account created. If email confirmation is enabled in Supabase, check your inbox before signing in.'
      );
    } else {
      const safeNext = nextParam.startsWith('/') ? nextParam : '/dashboard';
      router.push(safeNext);
    }
  };

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg accent-bg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-app">
              LetsFit
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-app mb-2 text-center">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-muted mb-8 text-center">
            {isSignup
              ? 'Start your fitness journey today.'
              : 'Log in to continue.'}
          </p>

          {!configured && (
            <div className="mb-6 p-3 rounded-lg surface text-xs text-muted leading-relaxed">
              <div className="font-medium text-app mb-1">
                Authentication not configured
              </div>
              See <code className="accent-text">SUPABASE_SETUP.md</code> for a
              5-minute setup guide.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field
              id="email"
              label="Email"
              icon={Mail}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />

            {isSignup && (
              <Field
                id="username"
                label="Username"
                icon={UserIcon}
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={setUsername}
                placeholder="yourname"
                hint="3–20 characters · letters, numbers, underscore"
              />
            )}

            <PasswordField
              id="password"
              label="Password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggleShow={() => setShowPassword((s) => !s)}
              hint={isSignup ? 'At least 6 characters' : undefined}
            />

            {isSignup && (
              <PasswordField
                id="confirm-password"
                label="Confirm password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showPassword}
                onToggleShow={() => setShowPassword((s) => !s)}
              />
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 p-3 rounded-lg accent-bg-soft border border-app text-xs text-app">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 accent-text" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg accent-bg text-white text-sm font-medium disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? isSignup
                  ? 'Creating account…'
                  : 'Logging in…'
                : isSignup
                ? 'Create account'
                : 'Log in'}
            </button>
          </form>

          <p className="text-xs text-muted text-center mt-6">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link href="/signin" className="accent-text hover:underline">
                  Log in
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="accent-text hover:underline">
                  Get started
                </Link>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  type,
  autoComplete,
  required,
  value,
  onChange,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  type: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-muted mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle" />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg surface text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
          placeholder={placeholder}
        />
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-subtle">{hint}</div>}
    </div>
  );
}

function PasswordField({
  id,
  label,
  autoComplete,
  value,
  onChange,
  show,
  onToggleShow,
  hint,
}: {
  id: string;
  label: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-muted mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 rounded-lg surface text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-subtle hover:text-app transition-colors"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-subtle">{hint}</div>}
    </div>
  );
}
