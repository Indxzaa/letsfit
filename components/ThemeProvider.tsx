'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { loadProgress, subscribeToProgress } from '@/lib/progress';
import { ACCENT_THEMES, getShopItem } from '@/lib/shop';

const THEME_BG: Record<string, string> = {
  'aqua-depths':  'linear-gradient(160deg, #020d1a 0%, #041828 50%, #020e18 100%)',
  'mystic-bloom': 'linear-gradient(160deg, #0d0418 0%, #130520 50%, #09020e 100%)',
  'sunset-forge': 'linear-gradient(160deg, #160900 0%, #1c0d00 50%, #100600 100%)',
  'dream-pastel': 'linear-gradient(160deg, #0c0918 0%, #12091e 50%, #09060e 100%)',
  'aurora-glow':  'linear-gradient(160deg, #030e08 0%, #050d0f 50%, #080414 100%)',
};

function startTransition() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.add('theme-transitioning');
  setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 420);
}

type Mode = 'light' | 'dark';
type ThemeContextValue = {
  mode: Mode; theme: Mode;
  toggleMode: () => void; toggleTheme: () => void;
  setMode: (m: Mode) => void; setTheme: (m: Mode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'letsfit:theme';

const PAGE_KEY_MAP: Array<[string, string]> = [
  ['/dashboard', 'dashboard'], ['/exercise', 'exercise'],
  ['/adventure', 'adventure'], ['/shop', 'shop'],
  ['/progress',  'progress'],  ['/boss',  'boss'],
];

function getPageKey(pathname: string): string | null {
  for (const [prefix, key] of PAGE_KEY_MAP) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return key;
  }
  return null;
}

function applyMode(mode: Mode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
}

function applyAccentFromProgress(mode: Mode, pathname?: string) {
  if (typeof document === 'undefined') return;
  const progress = loadProgress();
  const equippedThemeId = progress.equippedItems.theme ?? 'theme-emerald';
  const item = getShopItem(equippedThemeId);
  const themeKey = item?.value ?? 'emerald-wilds';
  const palette = ACCENT_THEMES[themeKey] ?? ACCENT_THEMES['emerald-wilds'];
  const root = document.documentElement;

  const pageKey = pathname ? getPageKey(pathname) : null;
  const pageOverride = pageKey
    ? (mode === 'dark' ? palette.pages?.[pageKey] : palette.pagesLight?.[pageKey])
    : null;

  const accent = pageOverride ?? (mode === 'dark' ? palette.dark : palette.light);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-hover', mode === 'dark' ? palette.light : palette.light);
  root.style.setProperty('--accent-soft', mode === 'dark' ? palette.soft : palette.lightSoft);
  root.style.setProperty('--accent-2', mode === 'dark' ? palette.secondary : palette.lightSecondary);
  root.style.setProperty('--accent-3', mode === 'dark' ? palette.tertiary : palette.lightTertiary);
  const rgb = hexToRgb(accent);
  if (rgb) {
    root.style.setProperty('--accent-bg', `rgba(${rgb}, ${mode === 'dark' ? '0.12' : '0.1'})`);
    root.style.setProperty('--accent-bg-strong', `rgba(${rgb}, ${mode === 'dark' ? '0.2' : '0.18'})`);
  }

  const bg = mode === 'dark' ? (THEME_BG[themeKey] ?? '') : '';
  document.documentElement.style.background = bg;
  document.body.style.background = bg;
  document.documentElement.style.setProperty('--page-bg', bg ? 'transparent' : '');
}

function hexToRgb(hex: string): string | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('dark');
  const pathname = usePathname();
  const equippedThemeRef = useRef<string>(
    typeof window !== 'undefined' ? (loadProgress().equippedItems.theme ?? 'theme-emerald') : 'theme-emerald'
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    const initial: Mode = stored === 'light' || stored === 'dark' ? stored : 'dark';
    setModeState(initial);
    applyMode(initial);
    applyAccentFromProgress(initial, pathname);
    const unsub = subscribeToProgress(() => {
      const m = (localStorage.getItem(STORAGE_KEY) as Mode | null) ?? 'dark';
      const newThemeId = loadProgress().equippedItems.theme ?? 'theme-emerald';
      if (newThemeId !== equippedThemeRef.current) {
        equippedThemeRef.current = newThemeId;
        startTransition();
      }
      applyAccentFromProgress(m, pathname);
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
    applyMode(m);
    startTransition();
    applyAccentFromProgress(m, pathname);
  };

  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ mode, theme: mode, toggleMode, toggleTheme: toggleMode, setMode, setTheme: setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
