import type { ShopItem } from './progress';

export const SHOP_ITEMS: ShopItem[] = [
  // Themes
  { id: 'theme-emerald', name: 'Emerald', description: 'Default green theme.', type: 'theme', cost: 0, value: 'emerald' },
  { id: 'theme-mint', name: 'Mint', description: 'Cooler, brighter green.', type: 'theme', cost: 80, value: 'mint' },
  { id: 'theme-forest', name: 'Forest', description: 'Deep, grounded green.', type: 'theme', cost: 80, value: 'forest' },
  { id: 'theme-sky', name: 'Sky', description: 'Calm blue accent.', type: 'theme', cost: 120, value: 'sky' },
  { id: 'theme-amber', name: 'Amber', description: 'Warm, energetic accent.', type: 'theme', cost: 120, value: 'amber' },
  { id: 'theme-rose', name: 'Rose', description: 'Soft pink accent.', type: 'theme', cost: 150, value: 'rose' },

  // Avatars (emoji-based)
  { id: 'avatar-default', name: 'Default', description: 'Standard avatar.', type: 'avatar', cost: 0, value: '🙂' },
  { id: 'avatar-flex', name: 'Flex', description: 'Show off the gains.', type: 'avatar', cost: 60, value: '💪' },
  { id: 'avatar-rocket', name: 'Rocket', description: 'For the goal-chasers.', type: 'avatar', cost: 100, value: '🚀' },
  { id: 'avatar-fire', name: 'Fire', description: 'On a streak.', type: 'avatar', cost: 100, value: '🔥' },
  { id: 'avatar-star', name: 'Star', description: 'Top performer.', type: 'avatar', cost: 150, value: '⭐' },
  { id: 'avatar-trophy', name: 'Trophy', description: 'For the champions.', type: 'avatar', cost: 200, value: '🏆' },

  // Borders
  { id: 'border-none', name: 'No border', description: 'Clean and minimal.', type: 'border', cost: 0, value: 'none' },
  { id: 'border-soft', name: 'Soft glow', description: 'Subtle accent ring.', type: 'border', cost: 90, value: 'soft' },
  { id: 'border-strong', name: 'Strong glow', description: 'Bold accent ring.', type: 'border', cost: 180, value: 'strong' },
  { id: 'border-gradient', name: 'Gradient', description: 'Multi-stop accent ring.', type: 'border', cost: 250, value: 'gradient' },

  // Badges
  { id: 'badge-none', name: 'No badge', description: 'Just you.', type: 'badge', cost: 0, value: '' },
  { id: 'badge-newcomer', name: 'Newcomer', description: 'Welcome to LetsFit.', type: 'badge', cost: 50, value: 'Newcomer' },
  { id: 'badge-grinder', name: 'Grinder', description: 'Always showing up.', type: 'badge', cost: 120, value: 'Grinder' },
  { id: 'badge-elite', name: 'Elite', description: 'A cut above.', type: 'badge', cost: 250, value: 'Elite' },
];

export const FREE_DEFAULTS = ['theme-emerald', 'avatar-default', 'border-none', 'badge-none'];

export const DEFAULT_EQUIPPED: Record<string, string> = {
  theme: 'theme-emerald',
  avatar: 'avatar-default',
  border: 'border-none',
  badge: 'badge-none',
};

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export const ACCENT_THEMES: Record<string, { dark: string; soft: string; light: string; lightSoft: string }> = {
  emerald: { dark: '#22c55e', soft: '#4ade80', light: '#16a34a', lightSoft: '#22c55e' },
  mint: { dark: '#34d399', soft: '#6ee7b7', light: '#10b981', lightSoft: '#34d399' },
  forest: { dark: '#15803d', soft: '#22c55e', light: '#14532d', lightSoft: '#15803d' },
  sky: { dark: '#3b82f6', soft: '#60a5fa', light: '#2563eb', lightSoft: '#3b82f6' },
  amber: { dark: '#f59e0b', soft: '#fbbf24', light: '#d97706', lightSoft: '#f59e0b' },
  rose: { dark: '#f43f5e', soft: '#fb7185', light: '#e11d48', lightSoft: '#f43f5e' },
};
