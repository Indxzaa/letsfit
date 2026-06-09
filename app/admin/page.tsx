'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Coins,
  Trophy,
  Activity,
  RotateCcw,
  Plus,
  Minus,
  Shield,
  ShieldOff,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import {
  fetchAllUsers,
  grantCoins,
  setUserRole,
  resetUserProgress,
  type AdminUser,
} from '@/lib/adminRole';
import { useAuth } from '@/components/AuthProvider';

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [coinInputs, setCoinInputs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setUsers(await fetchAllUsers());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const totalXp = users.reduce((s, u) => s + (u.xp ?? 0), 0);
  const totalCoins = users.reduce((s, u) => s + (u.fit_coins ?? 0), 0);
  const totalSessions = users.reduce((s, u) => s + (u.total_sessions ?? 0), 0);
  const totalAchievements = users.reduce((s, u) => s + (u.achievement_count ?? 0), 0);

  const handleGrant = async (userId: string, delta: number) => {
    const amount = parseInt(coinInputs[userId] ?? '10', 10);
    if (isNaN(amount) || amount <= 0) return showToast('Enter a valid amount', false);
    setBusy(userId + 'coins');
    const err = await grantCoins(userId, delta * amount);
    setBusy(null);
    if (err) { showToast(err, false); } else { showToast(`${delta > 0 ? '+' : ''}${delta * amount} FitCoins applied`); await refresh(); }
  };

  const handleRoleToggle = async (u: AdminUser) => {
    if (u.id === user?.id) return showToast("Can't change your own role", false);
    const next = u.role === 'admin' ? 'user' : 'admin';
    setBusy(u.id + 'role');
    const err = await setUserRole(u.id, next);
    setBusy(null);
    if (err) { showToast(err, false); } else { showToast(`${u.username ?? u.id} is now ${next}`); await refresh(); }
  };

  const handleReset = async (u: AdminUser) => {
    if (!confirm(`Reset ALL progress for ${u.username ?? u.id}? This cannot be undone.`)) return;
    if (u.id === user?.id) return showToast("Can't reset your own account", false);
    setBusy(u.id + 'reset');
    const err = await resetUserProgress(u.id);
    setBusy(null);
    if (err) { showToast(err, false); } else { showToast('Progress reset'); await refresh(); }
  };

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-bg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium accent-text">Admin panel</div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-app">User management</h1>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Users} label="Total users" value={users.length} />
          <StatCard icon={Coins} label="FitCoins issued" value={totalCoins.toLocaleString()} />
          <StatCard icon={Activity} label="Total sessions" value={totalSessions} />
          <StatCard icon={Trophy} label="Achievements earned" value={totalAchievements} />
        </div>

        {/* User table */}
        <div className="surface rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-app flex items-center justify-between">
            <h2 className="text-base font-semibold text-app">
              Users ({users.length})
            </h2>
            <button
              onClick={refresh}
              className="text-xs text-muted hover:text-app flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-sm text-subtle">
              No users found. Make sure the admin_users_view exists in Supabase.
            </div>
          ) : (
            <div className="divide-y divider">
              {users.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="p-4 sm:p-5"
                >
                  {/* User info row */}
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                        u.role === 'admin' ? 'accent-bg text-white' : 'bg-[var(--border)] text-muted'
                      }`}>
                        {(u.username ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-app">{u.username ?? 'No username'}</span>
                          {u.role === 'admin' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold accent-text bg-[var(--accent)]/15 rounded">
                              ADMIN
                            </span>
                          )}
                          {u.id === user?.id && (
                            <span className="text-[10px] text-subtle">(you)</span>
                          )}
                        </div>
                        <div className="text-xs text-subtle font-mono truncate max-w-[200px]">{u.id}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                      <span><span className="text-app font-medium">{u.xp ?? 0}</span> XP</span>
                      <span><span className="text-app font-medium">🪙 {u.fit_coins ?? 0}</span></span>
                      <span><span className="text-app font-medium">{u.total_sessions ?? 0}</span> sessions</span>
                      <span><span className="text-app font-medium">{u.total_reps ?? 0}</span> reps</span>
                      <span><span className="text-app font-medium">{u.achievement_count ?? 0}</span> badges</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Coin grant/remove */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={coinInputs[u.id] ?? '10'}
                        onChange={(e) => setCoinInputs((prev) => ({ ...prev, [u.id]: e.target.value }))}
                        className="w-16 px-2 py-1.5 rounded-lg surface text-xs text-app focus:outline-none"
                      />
                      <button
                        disabled={busy === u.id + 'coins'}
                        onClick={() => handleGrant(u.id, 1)}
                        className="px-2 py-1.5 rounded-lg surface surface-hover text-xs text-app flex items-center gap-1 disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" /> Coins
                      </button>
                      <button
                        disabled={busy === u.id + 'coins'}
                        onClick={() => handleGrant(u.id, -1)}
                        className="px-2 py-1.5 rounded-lg surface surface-hover text-xs text-app flex items-center gap-1 disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" /> Coins
                      </button>
                    </div>

                    {/* Role toggle */}
                    <button
                      disabled={busy === u.id + 'role' || u.id === user?.id}
                      onClick={() => handleRoleToggle(u)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-40 ${
                        u.role === 'admin'
                          ? 'surface surface-hover text-app'
                          : 'surface surface-hover text-app'
                      }`}
                    >
                      {u.role === 'admin' ? (
                        <><ShieldOff className="w-3 h-3" /> Remove admin</>
                      ) : (
                        <><Shield className="w-3 h-3" /> Make admin</>
                      )}
                    </button>

                    {/* Reset progress */}
                    <button
                      disabled={busy === u.id + 'reset' || u.id === user?.id}
                      onClick={() => handleReset(u)}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 surface surface-hover flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset progress
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* XP summary */}
        <div className="mt-4 surface rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm text-muted">Total XP across all users</span>
          <span className="text-sm font-semibold text-app tabular-nums">{totalXp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-50 ${
            toast.ok ? 'accent-bg text-white' : 'bg-red-500/90 text-white'
          }`}
        >
          {toast.msg}
        </motion.div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs text-subtle mb-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-2xl font-semibold text-app tabular-nums">{value}</div>
    </div>
  );
}
