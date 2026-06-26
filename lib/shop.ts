import type { ShopItem } from './progress';

export const RARITY_CONFIG: Record<string, { label: string; color: string }> = {
  common:    { label: 'Starter',   color: '#7eb89a' },
  rare:      { label: 'Rare',      color: '#7ab0d8' },
  epic:      { label: 'Epic',      color: '#a888e0' },
  legendary: { label: 'Legendary', color: '#d8a848' },
  mythic:    { label: 'Mythic',    color: '#d87898' },
  world:     { label: 'World',     color: '#60c898' },
};

export const SHOP_ITEMS: ShopItem[] = [
  // Themes — 6 premium multi-palette skins
  { id: 'theme-emerald',      name: 'Emerald Wilds',  description: 'Verdant greens shift across every page.',          type: 'theme', cost: 0,     value: 'emerald-wilds',  rarity: 'common' },
  { id: 'theme-aqua-depths',  name: 'Aqua Depths',    description: 'Deep ocean blues and teal currents.',              type: 'theme', cost: 2500,  value: 'aqua-depths',    rarity: 'rare' },
  { id: 'theme-mystic-bloom', name: 'Mystic Bloom',   description: 'Violet, rose, and fuchsia fantasy palette.',       type: 'theme', cost: 5000,  value: 'mystic-bloom',   rarity: 'epic' },
  { id: 'theme-sunset-forge', name: 'Sunset Forge',   description: 'Fire orange, amber, and deep red embers.',         type: 'theme', cost: 7500,  value: 'sunset-forge',   rarity: 'rare' },
  { id: 'theme-dream-pastel', name: 'Dream Pastel',   description: 'Lavender, peach, mint — softly surreal.',          type: 'theme', cost: 10000, value: 'dream-pastel',   rarity: 'epic' },
  { id: 'theme-aurora-glow',  name: 'Aurora Glow',    description: 'Each page glows a different aurora color.',        type: 'theme', cost: 20000, value: 'aurora-glow',    rarity: 'legendary' },

  // Avatars
  { id: 'avatar-default', name: 'Default', description: 'Standard avatar.',       type: 'avatar', cost: 0,   value: '🙂', rarity: 'common' },
  { id: 'avatar-flex',    name: 'Flex',    description: 'Show off the gains.',     type: 'avatar', cost: 60,  value: '💪', rarity: 'common' },
  { id: 'avatar-rocket',  name: 'Rocket',  description: 'For the goal-chasers.',   type: 'avatar', cost: 100, value: '🚀', rarity: 'rare' },
  { id: 'avatar-fire',    name: 'Fire',    description: 'On a streak.',            type: 'avatar', cost: 100, value: '🔥', rarity: 'rare' },
  { id: 'avatar-star',    name: 'Star',    description: 'Top performer.',          type: 'avatar', cost: 200, value: '⭐', rarity: 'epic' },
  { id: 'avatar-trophy',  name: 'Trophy',  description: 'For the champions.',      type: 'avatar', cost: 300, value: '🏆', rarity: 'epic' },
  { id: 'avatar-crown',   name: 'Crown',   description: 'Royalty only.',           type: 'avatar', cost: 600, value: '👑', rarity: 'legendary' },
  { id: 'avatar-diamond', name: 'Diamond', description: 'The hardest grind.',      type: 'avatar', cost: 1200, value: '💎', rarity: 'mythic' },

  // Borders
  { id: 'border-none',     name: 'No Border',    description: 'Clean look.',                 type: 'border', cost: 0,    value: 'none',     rarity: 'common' },
  { id: 'border-neon',     name: 'Neon Pulse',   description: 'Flickering cyan neon ring.',  type: 'border', cost: 90,   value: 'neon',     rarity: 'common' },
  { id: 'border-crystal',  name: 'Crystal Edge', description: 'Crystal-clear icy shimmer.',  type: 'border', cost: 150,  value: 'crystal',  rarity: 'rare' },
  { id: 'border-royal',    name: 'Royal Gold',   description: 'Pulsing golden ring.',        type: 'border', cost: 200,  value: 'royal',    rarity: 'rare' },
  { id: 'border-flame',    name: 'Shadow Flame', description: 'Dark fire conic spin.',       type: 'border', cost: 350,  value: 'flame',    rarity: 'epic' },
  { id: 'border-galaxy',   name: 'Galaxy Ring',  description: 'Deep space conic gradient.',  type: 'border', cost: 500,  value: 'galaxy',   rarity: 'epic' },
  { id: 'border-electric', name: 'Electric',     description: 'Blue and gold lightning.',    type: 'border', cost: 900,  value: 'electric', rarity: 'legendary' },
  { id: 'border-floral',   name: 'Floral Bloom', description: 'Soft pink and green petals.', type: 'border', cost: 2000, value: 'floral',   rarity: 'mythic' },

  // Auras
  { id: 'aura-none',      name: 'No Aura',   description: 'No aura effect.',             type: 'aura', cost: 0,    value: '',          rarity: 'common' },
  { id: 'aura-emerald',   name: 'Emerald',   description: 'Green growth pulse.',          type: 'aura', cost: 150,  value: 'emerald',   rarity: 'common' },
  { id: 'aura-sakura',    name: 'Sakura',    description: 'Soft pink petal bloom.',       type: 'aura', cost: 200,  value: 'sakura',    rarity: 'rare' },
  { id: 'aura-ocean',     name: 'Ocean',     description: 'Deep blue tidal swell.',       type: 'aura', cost: 300,  value: 'ocean',     rarity: 'rare' },
  { id: 'aura-flame',     name: 'Flame',     description: 'Flickering fire aura.',        type: 'aura', cost: 400,  value: 'flame',     rarity: 'rare' },
  { id: 'aura-crystal',   name: 'Crystal',   description: 'Rotating icy shimmer ring.',   type: 'aura', cost: 600,  value: 'crystal',   rarity: 'epic' },
  { id: 'aura-lightning', name: 'Lightning', description: 'Electric strobe field.',       type: 'aura', cost: 800,  value: 'lightning', rarity: 'epic' },
  { id: 'aura-galaxy',    name: 'Galaxy',    description: 'Deep-space conic spin.',       type: 'aura', cost: 1000, value: 'galaxy',    rarity: 'legendary' },
  { id: 'aura-aurora',    name: 'Aurora',    description: 'Aurora borealis color shift.', type: 'aura', cost: 1500, value: 'aurora',    rarity: 'legendary' },
  { id: 'aura-shadow',    name: 'Shadow',    description: 'Void absorption field.',       type: 'aura', cost: 2200, value: 'shadow',    rarity: 'mythic' },
  { id: 'aura-solar',     name: 'Solar',     description: 'Golden solar flare burst.',    type: 'aura', cost: 3500, value: 'solar',     rarity: 'mythic' },
];

export const FREE_DEFAULTS = ['theme-emerald', 'avatar-default', 'border-none', 'aura-none'];

export const DEFAULT_EQUIPPED: Record<string, string> = {
  theme:  'theme-emerald',
  avatar: 'avatar-default',
  border: 'border-none',
  aura:   'aura-none',
};

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export type AccentPalette = {
  dark: string; soft: string; secondary: string; tertiary: string;
  light: string; lightSoft: string; lightSecondary: string; lightTertiary: string;
  /** Per-page accent overrides (dark mode). Keys: dashboard, exercise, adventure, shop, progress, boss */
  pages?: Record<string, string>;
  /** Per-page accent overrides (light mode). */
  pagesLight?: Record<string, string>;
};

export const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  exercise:  'Exercise',
  adventure: 'Adventure',
  shop:      'Shop',
  progress:  'Progress',
  boss:      'Boss',
};

export const ACCENT_THEMES: Record<string, AccentPalette> = {
  'emerald-wilds': {
    dark: '#4ade80', soft: '#86efac', secondary: '#22c55e', tertiary: '#bbf7d0',
    light: '#16a34a', lightSoft: '#4ade80', lightSecondary: '#15803d', lightTertiary: '#86efac',
    pages:      { dashboard: '#4ade80', exercise: '#22c55e', adventure: '#10b981', shop: '#34d399', progress: '#6ee7b7', boss: '#15803d' },
    pagesLight: { dashboard: '#16a34a', exercise: '#15803d', adventure: '#059669', shop: '#0d9488', progress: '#047857', boss: '#14532d' },
  },
  'aqua-depths': {
    dark: '#22d3ee', soft: '#a5f3fc', secondary: '#0ea5e9', tertiary: '#bae6fd',
    light: '#0891b2', lightSoft: '#22d3ee', lightSecondary: '#0284c7', lightTertiary: '#7dd3fc',
    pages:      { dashboard: '#22d3ee', exercise: '#0ea5e9', adventure: '#6366f1', shop: '#06b6d4', progress: '#38bdf8', boss: '#1d4ed8' },
    pagesLight: { dashboard: '#0891b2', exercise: '#0369a1', adventure: '#4f46e5', shop: '#0284c7', progress: '#0284c7', boss: '#1e40af' },
  },
  'mystic-bloom': {
    dark: '#c084fc', soft: '#d8b4fe', secondary: '#a855f7', tertiary: '#e9d5ff',
    light: '#9333ea', lightSoft: '#c084fc', lightSecondary: '#7c3aed', lightTertiary: '#ddd6fe',
    pages:      { dashboard: '#c084fc', exercise: '#a855f7', adventure: '#ec4899', shop: '#8b5cf6', progress: '#e879f9', boss: '#7c3aed' },
    pagesLight: { dashboard: '#9333ea', exercise: '#7c3aed', adventure: '#db2777', shop: '#6d28d9', progress: '#c026d3', boss: '#5b21b6' },
  },
  'sunset-forge': {
    dark: '#fb923c', soft: '#fdba74', secondary: '#fbbf24', tertiary: '#fed7aa',
    light: '#ea580c', lightSoft: '#fb923c', lightSecondary: '#d97706', lightTertiary: '#fde68a',
    pages:      { dashboard: '#fb923c', exercise: '#f97316', adventure: '#ef4444', shop: '#fbbf24', progress: '#f59e0b', boss: '#dc2626' },
    pagesLight: { dashboard: '#ea580c', exercise: '#c2410c', adventure: '#b91c1c', shop: '#d97706', progress: '#b45309', boss: '#991b1b' },
  },
  'dream-pastel': {
    dark: '#a78bfa', soft: '#c4b5fd', secondary: '#f9a8d4', tertiary: '#ddd6fe',
    light: '#7c3aed', lightSoft: '#a78bfa', lightSecondary: '#db2777', lightTertiary: '#c4b5fd',
    pages:      { dashboard: '#a78bfa', exercise: '#f9a8d4', adventure: '#6ee7b7', shop: '#7dd3fc', progress: '#fca5a5', boss: '#c084fc' },
    pagesLight: { dashboard: '#7c3aed', exercise: '#db2777', adventure: '#059669', shop: '#0284c7', progress: '#dc2626', boss: '#9333ea' },
  },
  'aurora-glow': {
    dark: '#34d399', soft: '#6ee7b7', secondary: '#818cf8', tertiary: '#a5f3fc',
    light: '#059669', lightSoft: '#34d399', lightSecondary: '#4f46e5', lightTertiary: '#c7d2fe',
    pages:      { dashboard: '#34d399', exercise: '#38bdf8', adventure: '#818cf8', shop: '#c084fc', progress: '#f472b6', boss: '#fbbf24' },
    pagesLight: { dashboard: '#059669', exercise: '#0284c7', adventure: '#4f46e5', shop: '#9333ea', progress: '#db2777', boss: '#d97706' },
  },
};
