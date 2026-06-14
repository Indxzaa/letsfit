import type { ShopItem } from './progress';

export const RARITY_CONFIG: Record<string, { label: string; color: string }> = {
  common:    { label: 'Common',    color: '#94a3b8' },
  rare:      { label: 'Rare',      color: '#3b82f6' },
  epic:      { label: 'Epic',      color: '#8b5cf6' },
  legendary: { label: 'Legendary', color: '#f59e0b' },
  mythic:    { label: 'Mythic',    color: '#ec4899' },
};

export const SHOP_ITEMS: ShopItem[] = [
  // Themes
  { id: 'theme-emerald', name: 'Emerald',  description: 'Default green theme.',    type: 'theme', cost: 0,   value: 'emerald', rarity: 'common' },
  { id: 'theme-mint',    name: 'Mint',     description: 'Cooler, brighter green.', type: 'theme', cost: 80,  value: 'mint',    rarity: 'common' },
  { id: 'theme-forest',  name: 'Forest',   description: 'Deep, grounded green.',   type: 'theme', cost: 80,  value: 'forest',  rarity: 'common' },
  { id: 'theme-sky',     name: 'Sky',      description: 'Calm blue accent.',        type: 'theme', cost: 120, value: 'sky',     rarity: 'rare' },
  { id: 'theme-amber',   name: 'Amber',    description: 'Warm, energetic accent.',  type: 'theme', cost: 120, value: 'amber',   rarity: 'rare' },
  { id: 'theme-rose',         name: 'Rose',        description: 'Soft pink accent.',        type: 'theme', cost: 150, value: 'rose',         rarity: 'rare' },
  { id: 'theme-florida-keys', name: 'Florida Keys', description: 'Tropical teal vibes.',     type: 'theme', cost: 200, value: 'florida-keys', rarity: 'epic' },
  { id: 'theme-ballerina',    name: 'Ballerina',    description: 'Elegant hot-pink accent.', type: 'theme', cost: 200, value: 'ballerina',    rarity: 'epic' },

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
  { id: 'border-none',     name: 'No Border',   description: 'Clean look.',                  type: 'border', cost: 0,    value: 'none',    rarity: 'common' },
  { id: 'border-neon',     name: 'Neon Pulse',  description: 'Flickering cyan neon ring.',   type: 'border', cost: 90,   value: 'neon',    rarity: 'common' },
  { id: 'border-crystal',  name: 'Crystal Edge', description: 'Crystal-clear icy shimmer.',   type: 'border', cost: 150,  value: 'crystal', rarity: 'rare' },
  { id: 'border-royal',    name: 'Royal Gold',  description: 'Pulsing golden ring.',         type: 'border', cost: 200,  value: 'royal',   rarity: 'rare' },
  { id: 'border-flame',    name: 'Shadow Flame',description: 'Dark fire conic spin.',        type: 'border', cost: 350,  value: 'flame',   rarity: 'epic' },
  { id: 'border-galaxy',   name: 'Galaxy Ring', description: 'Deep space conic gradient.',  type: 'border', cost: 500,  value: 'galaxy',  rarity: 'epic' },
  { id: 'border-electric', name: 'Electric',    description: 'Blue and gold lightning.',     type: 'border', cost: 900,  value: 'electric',rarity: 'legendary' },
  { id: 'border-floral',   name: 'Floral Bloom',description: 'Soft pink and green petals.',  type: 'border', cost: 2000, value: 'floral',  rarity: 'mythic' },

  // Auras
  { id: 'aura-none',      name: 'No Aura',    description: 'No aura effect.',              type: 'aura', cost: 0,    value: '',          rarity: 'common' },
  { id: 'aura-emerald',   name: 'Emerald',    description: 'Green growth pulse.',           type: 'aura', cost: 150,  value: 'emerald',   rarity: 'common' },
  { id: 'aura-sakura',    name: 'Sakura',     description: 'Soft pink petal bloom.',        type: 'aura', cost: 200,  value: 'sakura',    rarity: 'rare' },
  { id: 'aura-ocean',     name: 'Ocean',      description: 'Deep blue tidal swell.',        type: 'aura', cost: 300,  value: 'ocean',     rarity: 'rare' },
  { id: 'aura-flame',     name: 'Flame',      description: 'Flickering fire aura.',         type: 'aura', cost: 400,  value: 'flame',     rarity: 'rare' },
  { id: 'aura-crystal',   name: 'Crystal',    description: 'Rotating icy shimmer ring.',    type: 'aura', cost: 600,  value: 'crystal',   rarity: 'epic' },
  { id: 'aura-lightning', name: 'Lightning',  description: 'Electric strobe field.',        type: 'aura', cost: 800,  value: 'lightning', rarity: 'epic' },
  { id: 'aura-galaxy',    name: 'Galaxy',     description: 'Deep-space conic spin.',        type: 'aura', cost: 1000, value: 'galaxy',    rarity: 'legendary' },
  { id: 'aura-aurora',    name: 'Aurora',     description: 'Aurora borealis color shift.',  type: 'aura', cost: 1500, value: 'aurora',    rarity: 'legendary' },
  { id: 'aura-shadow',    name: 'Shadow',     description: 'Void absorption field.',        type: 'aura', cost: 2200, value: 'shadow',    rarity: 'mythic' },
  { id: 'aura-solar',     name: 'Solar',      description: 'Golden solar flare burst.',     type: 'aura', cost: 3500, value: 'solar',     rarity: 'mythic' },
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

export const ACCENT_THEMES: Record<string, { dark: string; soft: string; light: string; lightSoft: string; secondary?: string; secondaryLight?: string }> = {
  emerald: { dark: '#22c55e', soft: '#4ade80', light: '#16a34a', lightSoft: '#22c55e' },
  mint:    { dark: '#34d399', soft: '#6ee7b7', light: '#10b981', lightSoft: '#34d399' },
  forest:  { dark: '#15803d', soft: '#22c55e', light: '#14532d', lightSoft: '#15803d' },
  sky:     { dark: '#3b82f6', soft: '#60a5fa', light: '#2563eb', lightSoft: '#3b82f6' },
  amber:   { dark: '#f59e0b', soft: '#fbbf24', light: '#d97706', lightSoft: '#f59e0b' },
  rose:          { dark: '#f43f5e', soft: '#fb7185', light: '#e11d48', lightSoft: '#f43f5e' },
  'florida-keys':{ dark: '#14b8a6', soft: '#2dd4bf', light: '#0d9488', lightSoft: '#14b8a6', secondary: '#0891b2', secondaryLight: '#0e7490' },
  ballerina:     { dark: '#ec4899', soft: '#f472b6', light: '#db2777', lightSoft: '#ec4899', secondary: '#a855f7', secondaryLight: '#9333ea' },
};
