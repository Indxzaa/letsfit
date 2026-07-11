import type { ShopItem } from './progress';

export const RARITY_CONFIG: Record<string, { label: string; color: string }> = {
  common:    { label: 'Starter',   color: '#7eb89a' },
  rare:      { label: 'Rare',      color: '#7ab0d8' },
  epic:      { label: 'Epic',      color: '#a888e0' },
  legendary: { label: 'Legendary', color: '#d8a848' },
  mythic:    { label: 'Mythic',    color: '#d87898' },
  world:     { label: 'World',     color: '#60c898' },
  premium:   { label: 'Premium',   color: '#a855f7' },
  supreme:   { label: 'Supreme',   color: '#10b981' },
};

export const SHOP_ITEMS: ShopItem[] = [
  // Emojis — FitCoin purchases
  { id: 'emoji-angry',    name: 'Angry',               description: 'Send an angry reaction.',     type: 'emoji', cost: 100, value: '/emoji1.png', rarity: 'common' },
  { id: 'emoji-sassy',    name: 'Sassy',               description: 'Send a sassy reaction.',      type: 'emoji', cost: 150, value: '/emoji2.png', rarity: 'common' },
  { id: 'emoji-roses',    name: 'Roses',               description: 'Send a roses reaction.',      type: 'emoji', cost: 250, value: '/emoji3.png', rarity: 'rare' },
  { id: 'emoji-smile',    name: 'Smile',               description: 'Send a smile reaction.',      type: 'emoji', cost: 350, value: '/emoji4.png', rarity: 'rare' },
  { id: 'emoji-laughing', name: 'Laughing',            description: 'Send a laughing reaction.',   type: 'emoji', cost: 430, value: '/emoji5.png', rarity: 'epic' },
  { id: 'emoji-loser',    name: 'Loser',               description: 'Send a loser reaction.',      type: 'emoji', cost: 670, value: '/emoji6.png', rarity: 'epic' },
  { id: 'emoji-bulleh',   name: 'Why You Bulleh Meh',  description: 'Send the ultimate reaction.', type: 'emoji', cost: 750, value: '/emoji7.png', rarity: 'legendary' },

  // Premium emojis — unlock automatically when fragment count reaches threshold (fragments are NOT spent)
  { id: 'prememoji1', name: 'Feet',   description: 'Unlock by collecting 100 Emoji Fragments.', type: 'emoji', cost: 100, value: '/prememoji1.png', rarity: 'premium', currency: 'fragments' },
  { id: 'prememoji2', name: 'Please', description: 'Unlock by collecting 150 Emoji Fragments.', type: 'emoji', cost: 150, value: '/prememoji2.png', rarity: 'premium', currency: 'fragments' },

  // Supreme emojis — Emerald purchases
  { id: 'suprememoji1', name: 'Tripple T', description: 'Exclusive supreme reaction.', type: 'emoji', cost: 25, value: '/suprememoji1.png', rarity: 'supreme', currency: 'emeralds' },
  { id: 'suprememoji2', name: 'Son',       description: 'Exclusive supreme reaction.', type: 'emoji', cost: 35, value: '/suprememoji2.png', rarity: 'supreme', currency: 'emeralds' },
];

export const EMOJI_ITEM_IDS = ['emoji-angry', 'emoji-sassy', 'emoji-roses', 'emoji-smile', 'emoji-laughing', 'emoji-loser', 'emoji-bulleh'];

export const FREE_DEFAULTS = ['border-none', 'aura-none'];

export const DEFAULT_EQUIPPED: Record<string, string> = {
  border: 'border-none',
  aura:   'aura-none',
};

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}
