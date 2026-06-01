'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { loadProgress, subscribeToProgress } from '@/lib/progress';
import { ACCENT_THEMES, getShopItem } from '@/lib/shop';

type Mode = 'light' | 'dark';

type ThemeContextValue = {
  mode: Mode;
  theme: Mode;
  toggleMode: () => void;
  toggleTheme: () => void;
  setMode: (m: Mode) => void;
  setTheme: (m: Mode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'letsfit:theme';

function applyMode(mode: Mode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
}

function applyAccentFromProgress(mode: Mode) {
  if (typeof document === 'undefined') return;
  const progress = loadProgress();
  const equippedThemeId = progress.equippedItems.theme ?? 'theme-emerald';
  const item = getShopItem(equippedThemeId);
  const themeKey = item?.value ?? 'emerald';
  const palette = ACCENT_THEMES[themeKey] ?? ACCENT_THEMES.emerald;
  const root = document.documentElement;
  if (mode === 'dark') {
    root.style.setProperty('--accent', palette.dark);
    root.style.setProperty('--accent-hover', palette.light);
    root.style.setProperty('--accent-soft', palette.soft);
    // accent-bg variations rebuild from accent
    const rgb = hexToRgb(palette.dark);
    if (rgb) {
      root.style.setProperty('--accent-bg', `rgba(${rgb}, 0.12)`);
      root.style.setProperty('--accent-bg-strong', `rgba(${rgb}, 0.2)`);
    }
  } else {
    root.style.setProperty('--accent', palette.light);
    root.style.setProperty('--accent-hover', palette.light);
    root.style.setProperty('--accent-soft', palette.lightSoft);
    const rgb = hexToRgb(palette.light);
    if (rgb) {
      root.style.setProperty('--accent-bg', `rgba(${rgb}, 0.1)`);
      root.style.setProperty('--accent-bg-strong', `rgba(${rgb}, 0.18)`);
    }
  }
}

function hexToRgb(hex: string): string | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('dark');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    const initial: Mode = stored === 'light' || stored === 'dark' ? stored : 'dark';
    setModeState(initial);
    applyMode(initial);
    applyAccentFromProgress(initial);

    // Re-apply accent when shop equipment changes
    const unsub = subscribeToProgress(() => {
      const m = (localStorage.getItem(STORAGE_KEY) as Mode | null) ?? 'dark';
      applyAccentFromProgress(m);
    });
    return unsub;
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
    applyMode(m);
    applyAccentFromProgress(m);
  };

  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: mode,
        toggleMode,
        toggleTheme: toggleMode,
        setMode,
        setTheme: setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
