'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthProvider';
import UserAvatar from './UserAvatar';
import { loadProgress, subscribeToProgress, type Progress } from '@/lib/progress';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut, loading, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    ...(isAdmin ? [{ name: 'Admin', href: '/admin' }] : []),
  ];

  const publicNavItems = [
    { name: 'Features', href: '/#features' },
    { name: 'How it works', href: '/#progress' },
  ];

  const navItems = user ? authedNavItems : publicNavItems;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-elev backdrop-blur-md border-b border-app' : ''
      }`}
      style={
        scrolled
          ? { backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)' }
          : undefined
      }
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg accent-bg flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-app">
              LetsFit
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm text-muted hover:text-app transition-colors rounded-lg"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {loading ? (
              <div className="w-20 h-9 rounded-lg surface animate-pulse" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg surface surface-hover text-sm text-app"
                >
                  <UserAvatar progress={progress} size="sm" />
                  <span className="max-w-[140px] truncate pr-1">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-lg surface bg-surface-solid shadow-lg overflow-hidden"
                    >
                      <div className="px-3 py-3 border-b border-app flex items-center gap-3">
                        <UserAvatar progress={progress} size="md" />
                        <div className="min-w-0">
                          <div className="text-xs text-subtle">Signed in as</div>
                          <div className="text-sm text-app truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/shop"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-app hover:bg-[var(--surface-hover)] transition-colors border-b border-app"
                      >
                        <span className="text-base">🪙</span>
                        Customize profile
                      </Link>
                      <button
                        onClick={async () => {
                          setMenuOpen(false);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-app hover:bg-[var(--surface-hover)] transition-colors"
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
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm text-app hover:text-muted transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white accent-bg rounded-lg transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-app p-2 -mr-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-app border-t border-app overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2.5 text-sm text-muted hover:text-app rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-app space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-xs text-subtle">
                      Signed in as {user.email}
                    </div>
                    <button
                      onClick={async () => {
                        setIsOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-app surface rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 text-sm text-app"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 text-sm font-medium text-white accent-bg rounded-lg text-center"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
