'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, LogOut, Coins, Pencil, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthProvider';
import UserAvatar from './UserAvatar';
import { loadProgress, saveProgress, subscribeToProgress, type Progress } from '@/lib/progress';
import { getUsername, setUsername } from '@/lib/profileSync';

const USERNAME_CHANGE_BASE_COST = 100;

function usernameCost(changeCount: number): number {
  return USERNAME_CHANGE_BASE_COST * (changeCount + 1);
}

function isValidUsername(u: string): boolean {
  return u.trim().length >= 2 && u.trim().length <= 30 && /^[a-zA-Z0-9_.-]+$/.test(u.trim());
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    setProgress(loadProgress());
    setUsernameState(getUsername());
    const unsub = subscribeToProgress(() => {
      setProgress(loadProgress());
      setUsernameState(getUsername());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setShowUsernameForm(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const displayName = username ?? user?.email?.split('@')[0] ?? '';

  const handleUsernameChange = async () => {
    const trimmed = newUsername.trim();
    if (!isValidUsername(trimmed)) {
      setUsernameError('2–30 chars, letters/numbers/._- only');
      return;
    }
    const current = loadProgress();
    const cost = usernameCost(current.usernameChangeCount);
    if (current.fitCoins < cost) {
      setUsernameError(`Need ${cost} FitCoins (you have ${current.fitCoins})`);
      return;
    }
    const updated: Progress = {
      ...current,
      fitCoins: current.fitCoins - cost,
      usernameChangeCount: current.usernameChangeCount + 1,
    };
    saveProgress(updated);
    setProgress(updated);
    if (user) await setUsername(user.id, trimmed);
    setUsernameState(trimmed);
    setUsernameSuccess(true);
    setShowUsernameForm(false);
    setNewUsername('');
    setUsernameError('');
    setTimeout(() => setUsernameSuccess(false), 2500);
  };

  const cost = progress ? usernameCost(progress.usernameChangeCount) : USERNAME_CHANGE_BASE_COST;

  const authedNavItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Exercise', href: '/exercise' },
    { name: 'Adventure', href: '/adventure' },
    { name: 'Shop', href: '/shop' },
    { name: 'Progress', href: '/progress' },
  ];

  const publicNavItems = [
    { name: 'Features', href: '/#features' },
    { name: 'How it works', href: '/#progress' },
  ];

  const navItems = user ? authedNavItems : publicNavItems;

  return (
    <motion.div
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <nav className="navbar-float max-w-6xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl accent-bg flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-700 text-app tracking-tight">
              LetsFit
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm text-muted hover:text-app transition-colors duration-150 rounded-xl hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {loading ? (
              <div className="w-20 h-9 rounded-xl bg-[var(--surface)] animate-pulse" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => { setMenuOpen((o) => !o); setShowUsernameForm(false); }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl surface surface-hover text-sm text-app cursor-pointer"
                  aria-label="User menu"
                >
                  <UserAvatar progress={progress} size="sm" />
                  <span className="max-w-[120px] truncate pr-1">{displayName}</span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 clay-card overflow-hidden"
                    >
                      <div className="px-3 py-3 border-b border-app flex items-center gap-3">
                        <UserAvatar progress={progress} size="md" />
                        <div className="min-w-0">
                          <div className="text-xs text-subtle">Signed in as</div>
                          <div className="text-sm text-app truncate font-medium">{displayName}</div>
                          <div className="text-xs text-subtle truncate">{user.email}</div>
                        </div>
                        {usernameSuccess && (
                          <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                        )}
                      </div>
                      {progress && (
                        <div className="px-3 py-2.5 border-b border-app flex items-center gap-2 text-xs text-subtle">
                          <Coins className="w-3.5 h-3.5 accent-text" />
                          <span className="text-app font-medium">{progress.fitCoins.toLocaleString()}</span>
                          <span>FitCoins</span>
                        </div>
                      )}

                      {/* Change username */}
                      <div className="border-b border-app">
                        {!showUsernameForm ? (
                          <button
                            onClick={() => { setShowUsernameForm(true); setNewUsername(username ?? ''); setUsernameError(''); }}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-app hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Pencil className="w-4 h-4 accent-text" />
                              Change Username
                            </span>
                            <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{cost} coins</span>
                          </button>
                        ) : (
                          <div className="p-3 space-y-2">
                            <div className="text-xs text-subtle mb-1">Cost: <span className="font-bold text-app">{cost} FitCoins</span></div>
                            <input
                              autoFocus
                              value={newUsername}
                              onChange={(e) => { setNewUsername(e.target.value); setUsernameError(''); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleUsernameChange(); if (e.key === 'Escape') { setShowUsernameForm(false); setUsernameError(''); } }}
                              placeholder="New username"
                              className="w-full px-3 py-2 text-sm rounded-xl surface border border-app text-app outline-none focus:border-[var(--accent)] transition-colors"
                            />
                            {usernameError && <div className="text-xs text-red-500">{usernameError}</div>}
                            <div className="flex gap-2">
                              <button
                                onClick={handleUsernameChange}
                                className="flex-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl cursor-pointer"
                                style={{ background: 'var(--accent)' }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => { setShowUsernameForm(false); setUsernameError(''); }}
                                className="flex-1 px-3 py-1.5 text-xs text-app surface rounded-xl cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <Link
                        href="/shop"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-app hover:bg-[var(--surface-hover)] transition-colors border-b border-app cursor-pointer"
                      >
                        <Coins className="w-4 h-4 accent-text" />
                        Customize profile
                      </Link>
                      <button
                        onClick={async () => { setMenuOpen(false); await signOut(); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-app hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/signin" className="px-4 py-2 text-sm text-muted hover:text-app transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-semibold text-white accent-bg rounded-xl transition-colors cursor-pointer">
                  Get started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-app p-2 -mr-1 rounded-xl hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="navbar-float max-w-6xl mx-auto mt-2 px-4 py-4 overflow-hidden"
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2.5 text-sm text-muted hover:text-app rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-app space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-xs text-subtle">Signed in as {displayName}</div>
                    <button
                      onClick={async () => { setIsOpen(false); await signOut(); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-app surface rounded-xl cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/signin" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm text-app">
                      Log in
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-white accent-bg rounded-xl text-center cursor-pointer">
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
