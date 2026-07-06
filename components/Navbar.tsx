'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, LogOut, Coins, Pencil, Check, Sun, Moon, Bell, Users } from 'lucide-react';
import { useState, useEffect, useRef, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import UserAvatar from './UserAvatar';
import { ProfilePictureModal } from './ProfilePictureModal';
import { getAvatarPublicUrl } from '@/lib/profilePicture';
import { loadProgress, saveProgress, subscribeToProgress, type Progress } from '@/lib/progress';
import { getUsername, setUsername } from '@/lib/profileSync';
import { useTheme } from './ThemeProvider';
import { NotificationPanel } from './social/notifications/NotificationPanel';
import { SocialContext } from './social/SocialProvider';

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
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut, loading } = useAuth();
  const { mode, toggleMode } = useTheme();
  const pathname = usePathname();
  const router   = useRouter();
  const social = useContext(SocialContext);

  useEffect(() => {
    setProgress(loadProgress());
    setUsernameState(getUsername());
    const unsub = subscribeToProgress(() => {
      setProgress(loadProgress());
      setUsernameState(getUsername());
    });
    return unsub;
  }, []);

  // Load avatar photo URL when user signs in
  useEffect(() => {
    if (user?.id) setPhotoUrl(getAvatarPublicUrl(user.id) || null);
    else setPhotoUrl(null);
  }, [user?.id]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setShowUsernameForm(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
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
    { name: 'Friends', href: '/friends' },
    { name: 'Shop', href: '/shop' },
    { name: 'Progress', href: '/progress' },
  ];

  const publicNavItems = [
    { name: 'Features', href: '/#features' },
    { name: 'How it works', href: '/#progress' },
  ];

  const navItems = user ? authedNavItems : publicNavItems;

  return (
    <div className="neo-navbar">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{ background: 'var(--neo-accent)', border: 'var(--neo-border)' }}
            >
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--neo-black)', letterSpacing: '-0.01em' }}>
              LETSFIT
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? '#fff' : 'var(--neo-black)',
                    padding: '0.4rem 0.875rem',
                    borderRadius: '9999px',
                    border: '1.5px solid transparent',
                    background: isActive ? 'var(--neo-accent)' : 'transparent',
                    transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--neo-surface)';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleMode}
              aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
              className="flex items-center shrink-0 cursor-pointer"
              style={{
                borderRadius: '9999px',
                border: '2px solid var(--neo-black)',
                background: 'var(--neo-surface)',
                color: 'var(--neo-black)',
                padding: '0.4rem 0.875rem',
                gap: '0.375rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                boxShadow: '2px 2px 0 var(--neo-black)',
                transition: 'box-shadow 0.1s ease, transform 0.1s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '4px 4px 0 var(--neo-black)';
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '2px 2px 0 var(--neo-black)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {mode === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{mode === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            {/* Notification bell — only when authenticated and social context is available */}
            {user && social && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(o => !o); setMenuOpen(false); }}
                  aria-label="Notifications"
                  className="relative flex items-center justify-center cursor-pointer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '9999px',
                    border: '2px solid var(--neo-black)',
                    background: 'var(--neo-surface)',
                    color: 'var(--neo-black)',
                    boxShadow: '2px 2px 0 var(--neo-black)',
                    transition: 'box-shadow 0.1s ease, transform 0.1s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '4px 4px 0 var(--neo-black)';
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '2px 2px 0 var(--neo-black)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <Bell className="w-4 h-4" />
                  {social.notifications.unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex items-center justify-center font-black"
                      style={{
                        width: 16,
                        height: 16,
                        background: 'var(--neo-red)',
                        border: '2px solid #000',
                        fontSize: 9,
                        color: '#fff',
                        borderRadius: '9999px',
                      }}
                    >
                      {Math.min(social.notifications.unreadCount, 9)}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <div style={{ position: 'relative' }}>
                      <NotificationPanel
                        notifications={social.notifications.notifications}
                        onAcceptFriend={async (id) => {
                          await social.friends.acceptRequest(id);
                          social.notifications.markAllRead();
                        }}
                        onDeclineFriend={async (id) => {
                          await social.friends.removeFriend(id);
                        }}
                        onOpenFriends={() => {
                          setNotifOpen(false);
                          social.notifications.markAllRead();
                          router.push('/friends');
                        }}
                        onJoinRoom={(roomId) => {
                          setNotifOpen(false);
                          window.location.href = `/workout-together/lobby?roomId=${roomId}`;
                        }}
                        onClose={() => { setNotifOpen(false); social.notifications.markAllRead(); }}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {loading ? (
              <div className="w-24 h-9" style={{ background: 'var(--neo-surface)', border: 'var(--neo-border)' }} />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => { setMenuOpen((o) => !o); setShowUsernameForm(false); }}
                  className="flex items-center cursor-pointer"
                  style={{
                    borderRadius: '9999px',
                    border: '2px solid var(--neo-black)',
                    background: 'var(--neo-surface)',
                    color: 'var(--neo-black)',
                    padding: '0.35rem 0.875rem 0.35rem 0.5rem',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: '2px 2px 0 var(--neo-black)',
                    transition: 'box-shadow 0.1s ease, transform 0.1s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '4px 4px 0 var(--neo-black)';
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '2px 2px 0 var(--neo-black)';
                    e.currentTarget.style.transform = 'none';
                  }}
                  aria-label="User menu"
                >
                  <UserAvatar photoUrl={photoUrl} letter={displayName.charAt(0)} size="sm" />
                  <span className="max-w-[120px] truncate">{displayName}</span>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-72 overflow-hidden"
                      style={{ background: 'var(--neo-white)', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow-lg)' }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '2px solid var(--neo-black)' }}>
                        <UserAvatar photoUrl={photoUrl} letter={displayName.charAt(0)} size="md" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--neo-black)', opacity: 0.5, fontFamily: 'var(--font-display)' }}>Signed in as</div>
                          <div className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-body)', color: 'var(--neo-black)' }}>{displayName}</div>
                          <div className="text-xs truncate" style={{ color: 'var(--neo-black)', opacity: 0.5 }}>{user.email}</div>
                        </div>
                        {usernameSuccess && <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--neo-green)' }} />}
                      </div>

                      {/* FitCoins */}
                      {progress && (
                        <div className="px-4 py-2.5 flex items-center gap-2 text-xs" style={{ borderBottom: '2px solid var(--neo-black)', fontFamily: 'var(--font-body)' }}>
                          <Coins className="w-3.5 h-3.5" style={{ color: 'var(--neo-accent)' }} />
                          <span className="font-bold" style={{ color: 'var(--neo-black)' }}>{progress.fitCoins.toLocaleString()}</span>
                          <span style={{ color: 'var(--neo-black)', opacity: 0.6 }}>FitCoins</span>
                        </div>
                      )}

                      {/* Change username */}
                      <div style={{ borderBottom: '2px solid var(--neo-black)' }}>
                        {!showUsernameForm ? (
                          <button
                            onClick={() => { setShowUsernameForm(true); setNewUsername(username ?? ''); setUsernameError(''); }}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm cursor-pointer transition-colors"
                            style={{ fontFamily: 'var(--font-body)', color: 'var(--neo-black)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--neo-surface)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <span className="flex items-center gap-2">
                              <Pencil className="w-4 h-4" style={{ color: 'var(--neo-accent)' }} />
                              Change Username
                            </span>
                            <span className="text-xs font-bold" style={{ color: 'var(--neo-accent)', fontFamily: 'var(--font-display)' }}>{cost} coins</span>
                          </button>
                        ) : (
                          <div className="p-3 space-y-2">
                            <div className="text-xs mb-1" style={{ color: 'var(--neo-black)', opacity: 0.6 }}>Cost: <span className="font-bold" style={{ color: 'var(--neo-black)' }}>{cost} FitCoins</span></div>
                            <input
                              autoFocus
                              value={newUsername}
                              onChange={(e) => { setNewUsername(e.target.value); setUsernameError(''); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleUsernameChange(); if (e.key === 'Escape') { setShowUsernameForm(false); setUsernameError(''); } }}
                              placeholder="New username"
                              className="neo-input text-sm"
                            />
                            {usernameError && <div className="text-xs" style={{ color: 'var(--neo-red)' }}>{usernameError}</div>}
                            <div className="flex gap-2">
                              <button
                                onClick={handleUsernameChange}
                                className="flex-1 px-3 py-1.5 text-xs font-bold cursor-pointer neo-btn neo-btn-primary"
                                style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => { setShowUsernameForm(false); setUsernameError(''); }}
                                className="flex-1 px-3 py-1.5 text-xs cursor-pointer neo-btn neo-btn-ghost"
                                style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', padding: '0.4rem 0.75rem', border: 'var(--neo-border)' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => { setMenuOpen(false); setShowPhotoModal(true); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm cursor-pointer transition-colors"
                        style={{ fontFamily: 'var(--font-body)', color: 'var(--neo-black)', borderBottom: '2px solid var(--neo-black)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--neo-surface)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Coins className="w-4 h-4" style={{ color: 'var(--neo-accent)' }} />
                        Profile Picture
                      </button>

                      <button
                        onClick={async () => { setMenuOpen(false); await signOut(); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm cursor-pointer transition-colors"
                        style={{ fontFamily: 'var(--font-body)', color: 'var(--neo-black)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--neo-surface)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
                  className="cursor-pointer"
                  style={{
                    borderRadius: '9999px',
                    border: '2px solid var(--neo-black)',
                    background: 'var(--neo-surface)',
                    padding: '0.4rem 0.875rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--neo-black)',
                    boxShadow: '2px 2px 0 var(--neo-black)',
                    transition: 'box-shadow 0.1s ease, transform 0.1s ease',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '4px 4px 0 var(--neo-black)';
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '2px 2px 0 var(--neo-black)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  Log in
                </Link>
                <Link href="/signup" className="neo-btn neo-btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                  Get started →
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 cursor-pointer"
            style={{ color: 'var(--neo-black)', border: 'var(--neo-border)', background: 'transparent' }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '3px solid var(--neo-black)', background: 'var(--neo-cream)' }}
          >
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2.5 text-sm font-semibold cursor-pointer"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: 'var(--neo-black)',
                      background: isActive ? 'var(--neo-surface)' : 'transparent',
                      borderLeft: isActive ? '4px solid var(--neo-accent)' : '4px solid transparent',
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 mt-3 space-y-3" style={{ borderTop: '2px solid var(--neo-black)' }}>
                {/* Theme toggle — mobile */}
                <button
                  onClick={toggleMode}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold cursor-pointer"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--neo-black)', background: 'var(--neo-surface)', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow-sm)' }}
                >
                  {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
                {user ? (
                  <>
                    <div className="px-3 py-1 text-xs font-bold uppercase" style={{ fontFamily: 'var(--font-display)', color: 'var(--neo-black)', opacity: 0.5 }}>Signed in as {displayName}</div>
                    <button
                      onClick={async () => { setIsOpen(false); await signOut(); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer neo-btn neo-btn-ghost"
                      style={{ fontFamily: 'var(--font-body)', border: 'var(--neo-border)', justifyContent: 'flex-start' }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/signin" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-semibold" style={{ fontFamily: 'var(--font-body)', color: 'var(--neo-black)' }}>
                      Log in
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)} className="neo-btn neo-btn-primary block text-center" style={{ width: '100%', justifyContent: 'center' }}>
                      Get started →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showPhotoModal && user && (
        <ProfilePictureModal
          userId={user.id}
          currentPhotoUrl={photoUrl}
          letter={displayName.charAt(0)}
          onSave={url => setPhotoUrl(url)}
          onClose={() => setShowPhotoModal(false)}
        />
      )}
    </div>
  );
}
