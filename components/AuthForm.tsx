'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Activity, Eye, EyeOff, Mail, Lock, User as UserIcon,
  Loader2, CheckCircle2, AlertCircle, Zap, Target, Flame,
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
    if (isSignup && password.length < 6) return 'Password must be at least 6 characters.';
    if (isSignup && password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!configured) {
      setError('Authentication is not configured. See SUPABASE_SETUP.md to add your keys.');
      return;
    }

    const issue = validate();
    if (issue) { setError(issue); return; }

    setLoading(true);
    const result = isSignup
      ? await signUp(email.trim(), password, username.trim())
      : await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) { setError(result.error); return; }
    if (isSignup) {
      setSuccess('Account created. If email confirmation is enabled in Supabase, check your inbox before signing in.');
    } else {
      const safeNext = nextParam.startsWith('/') ? nextParam : '/dashboard';
      router.push(safeNext);
    }
  };

  return (
    <div className="min-h-screen page-bg flex flex-col lg:flex-row">

      {/* ── Left Hero Panel ── */}
      <div
        className="neo-card-accent lg:w-[44%] flex flex-col justify-between p-8 lg:p-14"
        style={{ borderRadius: 0, boxShadow: 'none', borderRight: '4px solid var(--neo-black)' }}
      >
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        {/* Brand + Headline */}
        <div className="py-10 lg:py-0">
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-11 h-11 flex items-center justify-center bg-white"
              style={{ border: '3px solid var(--neo-black)', boxShadow: '3px 3px 0 var(--neo-black)' }}
            >
              <Activity className="w-5 h-5" style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold text-white uppercase tracking-widest">
              LetsFit
            </span>
          </div>

          <h1 className="font-display font-bold text-white uppercase leading-none mb-5"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', lineHeight: 0.95 }}>
            {isSignup ? 'Join\nNow.' : 'Welcome\nBack.'}
          </h1>
          <p className="text-white/75 text-lg font-semibold max-w-xs leading-snug">
            {isSignup
              ? 'Every rep brings you closer to your goal.'
              : 'Your streak is waiting. Keep it going.'}
          </p>
        </div>

        {/* Feature pills — desktop only */}
        <div className="hidden lg:flex flex-col gap-3">
          {[
            { icon: Zap,    text: 'AI-powered rep counting' },
            { icon: Flame,  text: 'Daily streak tracking' },
            { icon: Target, text: 'Boss battles & rewards' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}
              >
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white/80 text-sm font-semibold">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          {/* Mobile-only back + logo */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{ background: 'var(--accent)', border: '2px solid var(--neo-black)', boxShadow: '2px 2px 0 var(--neo-black)' }}
              >
                <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-base font-bold text-app uppercase tracking-widest">
                LetsFit
              </span>
            </div>
          </div>

          {/* Form card */}
          <div
            className="neo-card p-7 sm:p-9"
            style={{ borderRadius: 0, background: 'var(--neo-white)' }}
          >
            <div className="mb-7">
              <h2 className="font-display text-3xl font-bold text-app uppercase mb-2">
                {isSignup ? 'Create Account' : 'Log In'}
              </h2>
              <p className="text-sm text-muted">
                {isSignup ? 'Start your fitness journey today.' : 'Enter your details to continue.'}
              </p>
            </div>

            {!configured && (
              <div
                className="mb-7 p-4 text-xs text-muted leading-relaxed"
                style={{ background: 'var(--card-bg-amber)', border: '3px solid var(--neo-black)', boxShadow: '3px 3px 0 var(--neo-black)' }}
              >
                <div className="font-bold text-app mb-1 uppercase tracking-wider text-xs">
                  Auth not configured
                </div>
                See <code className="font-mono" style={{ color: 'var(--accent)' }}>SUPABASE_SETUP.md</code> for setup.
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
                  label="Confirm Password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showPassword}
                  onToggleShow={() => setShowPassword((s) => !s)}
                />
              )}

              {error && (
                <div
                  className="flex items-start gap-2 p-3.5 text-xs font-semibold"
                  style={{ background: '#fff0f0', border: '3px solid #ef4444', color: '#dc2626', boxShadow: '3px 3px 0 #ef4444' }}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div
                  className="flex items-start gap-2 p-3.5 text-xs font-semibold"
                  style={{ background: 'var(--card-bg-green)', border: '3px solid var(--accent)', color: 'var(--accent)', boxShadow: '3px 3px 0 var(--accent)' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: 'var(--accent)',
                  border: '3px solid var(--neo-black)',
                  boxShadow: '4px 4px 0 var(--neo-black)',
                  color: '#fff',
                  transform: loading ? 'translate(2px, 2px)' : undefined,
                }}
                onMouseDown={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.cssText +=
                    'box-shadow: 2px 2px 0 var(--neo-black); transform: translate(2px, 2px);';
                }}
                onMouseUp={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.cssText +=
                    'box-shadow: 4px 4px 0 var(--neo-black); transform: none;';
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? isSignup ? 'Creating account…' : 'Logging in…'
                  : isSignup ? 'Create Account' : 'Log In'}
              </button>
            </form>
          </div>

          {/* Switch mode link */}
          <p className="text-xs text-muted text-center mt-5">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link href="/signin" className="font-bold text-app hover:underline" style={{ color: 'var(--accent)' }}>
                  Log in
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
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
  id, label, icon: Icon, type, autoComplete, required, value, onChange, placeholder, hint,
}: {
  id: string; label: string; icon: typeof Mail; type: string;
  autoComplete?: string; required?: boolean; value: string;
  onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-app mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 text-sm text-app bg-transparent transition-all duration-100 outline-none"
          style={{
            border: '3px solid var(--neo-black)',
            background: 'var(--neo-surface)',
          }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--neo-black)'; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-subtle font-medium">{hint}</div>}
    </div>
  );
}

function PasswordField({
  id, label, autoComplete, value, onChange, show, onToggleShow, hint,
}: {
  id: string; label: string; autoComplete?: string; value: string;
  onChange: (v: string) => void; show: boolean; onToggleShow: () => void; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-app mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full pl-10 pr-11 py-3 text-sm text-app transition-all duration-100 outline-none"
          style={{
            border: '3px solid var(--neo-black)',
            background: 'var(--neo-surface)',
          }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '4px 4px 0 var(--neo-black)'; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-subtle hover:text-app transition-colors cursor-pointer"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-subtle font-medium">{hint}</div>}
    </div>
  );
}
