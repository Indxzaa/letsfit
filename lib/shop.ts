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
  { id: 'theme-rose',    name: 'Rose',     description: 'Soft pink accent.',        type: 'theme', cost: 150, value: 'rose',    rarity: 'rare' },

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
  { id: 'border-none',      name: 'No Border',    description: 'Clean look.',                   type: 'border', cost: 0,    value: 'none',      rarity: 'common' },
  { id: 'border-soft',      name: 'Soft Glow',    description: 'Subtle accent ring.',           type: 'border', cost: 90,   value: 'soft',      rarity: 'common' },
  { id: 'border-silver',    name: 'Silver Ring',  description: 'Polished silver border.',       type: 'border', cost: 150,  value: 'silver',    rarity: 'rare' },
  { id: 'border-strong',    name: 'Strong Glow',  description: 'Bold accent ring.',             type: 'border', cost: 180,  value: 'strong',    rarity: 'rare' },
  { id: 'border-gold',      name: 'Gold Ring',    description: 'Pulsing gold aura.',            type: 'border', cost: 450,  value: 'gold',      rarity: 'epic' },
  { id: 'border-gradient',  name: 'Gradient',     description: 'Multi-stop accent ring.',       type: 'border', cost: 250,  value: 'gradient',  rarity: 'epic' },
  { id: 'border-prismatic', name: 'Prismatic',    description: 'Animated rainbow border.',      type: 'border', cost: 900,  value: 'prismatic', rarity: 'legendary' },
  { id: 'border-cosmic',    name: 'Cosmic',       description: 'Dark cosmic energy border.',    type: 'border', cost: 2000, value: 'cosmic',    rarity: 'mythic' },

  // Badges
  { id: 'badge-none',      name: 'No Badge',  description: 'Just you.',              type: 'badge', cost: 0,    value: '',          rarity: 'common' },
  { id: 'badge-newcomer',  name: 'Newcomer',  description: 'Welcome to LetsFit.',    type: 'badge', cost: 50,   value: 'Newcomer',  rarity: 'common' },
  { id: 'badge-grinder',   name: 'Grinder',   description: 'Always showing up.',     type: 'badge', cost: 150,  value: 'Grinder',   rarity: 'rare' },
  { id: 'badge-elite',     name: 'Elite',     description: 'A cut above.',           type: 'badge', cost: 350,  value: 'Elite',     rarity: 'epic' },
  { id: 'badge-legend',    name: 'Legend',    description: 'Few reach this.',        type: 'badge', cost: 900,  value: 'Legend',    rarity: 'legendary' },
  { id: 'badge-apex',      name: 'APEX',      description: 'The absolute pinnacle.', type: 'badge', cost: 2000, value: 'APEX',      rarity: 'mythic' },

  // Titles
  { id: 'title-none',      name: 'No Title',    description: 'No title shown.',           type: 'title', cost: 0,    value: '',            rarity: 'common' },
  { id: 'title-rookie',    name: 'Rookie',      description: 'Just getting started.',     type: 'title', cost: 60,   value: 'Rookie',      rarity: 'common' },
  { id: 'title-grinder',   name: 'The Grinder', description: 'Consistent effort.',        type: 'title', cost: 200,  value: 'The Grinder', rarity: 'rare' },
  { id: 'title-elite',     name: 'Elite',       description: 'Top-tier performer.',       type: 'title', cost: 500,  value: 'Elite',       rarity: 'epic' },
  { id: 'title-immortal',  name: 'Immortal',    description: 'Beyond limits.',            type: 'title', cost: 1100, value: 'Immortal',    rarity: 'legendary' },
  { id: 'title-void',      name: 'Void Walker', description: 'Exists beyond the game.',   type: 'title', cost: 2500, value: 'Void Walker', rarity: 'mythic' },

  // Auras
  { id: 'aura-none',    name: 'No Aura',  description: 'No aura effect.',       type: 'aura', cost: 0,    value: '',       rarity: 'common' },
  { id: 'aura-ember',   name: 'Ember',    description: 'Warm orange pulse.',    type: 'aura', cost: 200,  value: 'ember',  rarity: 'rare' },
  { id: 'aura-storm',   name: 'Storm',    description: 'Electric indigo glow.', type: 'aura', cost: 550,  value: 'storm',  rarity: 'epic' },
  { id: 'aura-divine',  name: 'Divine',   description: 'Golden radiance.',      type: 'aura', cost: 1200, value: 'divine', rarity: 'legendary' },
  { id: 'aura-eclipse', name: 'Eclipse',  description: 'Dark matter energy.',   type: 'aura', cost: 2800, value: 'eclipse', rarity: 'mythic' },
];

export const FREE_DEFAULTS = ['theme-emerald', 'avatar-default', 'border-none', 'badge-none', 'title-none', 'aura-none'];

export const DEFAULT_EQUIPPED: Record<string, string> = {
  theme:  'theme-emerald',
  avatar: 'avatar-default',
  border: 'border-none',
  badge:  'badge-none',
  title:  'title-none',
  aura:   'aura-none',
};

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export const ACCENT_THEMES: Record<string, { dark: string; soft: string; light: string; lightSoft: string }> = {
  emerald: { dark: '#22c55e', soft: '#4ade80', light: '#16a34a', lightSoft: '#22c55e' },
  mint:    { dark: '#34d399', soft: '#6ee7b7', light: '#10b981', lightSoft: '#34d399' },
  forest:  { dark: '#15803d', soft: '#22c55e', light: '#14532d', lightSoft: '#15803d' },
  sky:     { dark: '#3b82f6', soft: '#60a5fa', light: '#2563eb', lightSoft: '#3b82f6' },
  amber:   { dark: '#f59e0b', soft: '#fbbf24', light: '#d97706', lightSoft: '#f59e0b' },
  rose:    { dark: '#f43f5e', soft: '#fb7185', light: '#e11d48', lightSoft: '#f43f5e' },
};
