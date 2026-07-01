'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Mode = 'light' | 'dark';
type ThemeContextValue = {
  mode: Mode; theme: Mode;
  toggleMode: () => void; toggleTheme: () => void;
  setMode: (m: Mode) => void; setTheme: (m: Mode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'letsfit:theme';

function applyMode(mode: Mode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('dark');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    const initial: Mode = stored === 'light' || stored === 'dark' ? stored : 'dark';
    setModeState(initial);
    applyMode(initial);
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('theme-transitioning');
      setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 420);
    }
    applyMode(m);
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
