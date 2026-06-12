'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, LogOut, Coins } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthProvider';
import UserAvatar from './UserAvatar';
import { loadProgress, subscribeToProgress, type Progress } from '@/lib/progress';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    setProgress(loadProgress());
    const unsub = subscribeToProgress(() => setProgress(loadProgress()));
    return unsub;
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const authedNavItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Exercise', href: '/exercise' },
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

          <div className="hidden md:flex items-center gap-0.5">
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
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl surface surface-hover text-sm text-app cursor-pointer"
                  aria-label="User menu"
                >
                  <UserAvatar progress={progress} size="sm" />
                  <span className="max-w-[120px] truncate pr-1">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 clay-card overflow-hidden"
                    >
                      <div className="px-3 py-3 border-b border-app flex items-center gap-3">
                        <UserAvatar progress={progress} size="md" />
                        <div className="min-w-0">
                          <div className="text-xs text-subtle">Signed in as</div>
                          <div className="text-sm text-app truncate font-medium">{user.email}</div>
                        </div>
                      </div>
                      {progress && (
                        <div className="px-3 py-2.5 border-b border-app flex items-center gap-2 text-xs text-subtle">
                          <Coins className="w-3.5 h-3.5 accent-text" />
                          <span className="text-app font-medium">{progress.fitCoins.toLocaleString()}</span>
                          <span>FitCoins</span>
                        </div>
                      )}
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
                    <div className="px-3 py-2 text-xs text-subtle">Signed in as {user.email}</div>
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
