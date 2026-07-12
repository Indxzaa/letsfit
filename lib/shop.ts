import type { ShopItem } from './progress';

export const RARITY_CONFIG: Record<string, { label: string; color: string }> = {
  common:         { label: 'Starter',        color: '#7eb89a' },
  rare:           { label: 'Rare',           color: '#7ab0d8' },
  epic:           { label: 'Epic',           color: '#a888e0' },
  legendary:      { label: 'Legendary',      color: '#d8a848' },
  mythic:         { label: 'Mythic',         color: '#d87898' },
  world:          { label: 'World',          color: '#60c898' },
  premium:        { label: 'Premium',        color: '#a855f7' },
  supreme:        { label: 'Supreme',        color: '#10b981' },
  'chest-exclusive': { label: 'Chest Only',  color: '#f59e0b' },
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
  { id: 'prememoji1', name: 'Feet tickles',   description: 'Unlock by collecting 100 Emoji Fragments.', type: 'emoji', cost: 100, value: '/prememoji1.png', rarity: 'premium', currency: 'fragments' },
  { id: 'prememoji2', name: 'Please i need this', description: 'Unlock by collecting 150 Emoji Fragments.', type: 'emoji', cost: 150, value: '/prememoji2.png', rarity: 'premium', currency: 'fragments' },

  // Supreme emojis — Emerald purchases
  { id: 'suprememoji1', name: 'Tripple T', description: 'Exclusive supreme reaction.', type: 'emoji', cost: 25, value: '/suprememoji1.png', rarity: 'supreme', currency: 'emeralds' },
  { id: 'suprememoji2', name: 'Son',       description: 'Exclusive supreme reaction.', type: 'emoji', cost: 35, value: '/suprememoji2.png', rarity: 'supreme', currency: 'emeralds' },
];

export const FRAME_ITEMS: ShopItem[] = [
  // Common frames — FitCoin purchases
  { id: 'frame-stars',   name: 'Stars',   description: 'A stellar profile frame.',     type: 'frame', cost: 100, value: '/frame1.png',      rarity: 'common' },
  { id: 'frame-dianum',  name: 'Dianum',  description: 'An elegant profile frame.',    type: 'frame', cost: 150, value: '/frame2.png',      rarity: 'common' },

  // Premium frames — auto-unlock when fragment count reaches threshold (fragments NOT spent)
  { id: 'frame-dolly',   name: 'Dolly',   description: 'Unlock by collecting 50 Emoji Fragments.',  type: 'frame', cost: 50,  value: '/premframe1.png', rarity: 'premium', currency: 'fragments' },
  { id: 'frame-redgem',  name: 'Redgem',  description: 'Unlock by collecting 80 Emoji Fragments.',  type: 'frame', cost: 80,  value: '/premframe2.png', rarity: 'premium', currency: 'fragments' },

  // Supreme frames — Emerald purchases
  { id: 'frame-koryu',   name: 'Kōryū',   description: 'Exclusive supreme profile frame.',          type: 'frame', cost: 100, value: '/supremframe1.png', rarity: 'supreme', currency: 'emeralds' },

  // Chest exclusive — cannot be purchased
  { id: 'frame-saburau', name: 'Saburau', description: 'Obtain from Legendary Chest or higher.',    type: 'frame', cost: 0,   value: '/supremframe2.png', rarity: 'chest-exclusive' },
];

export const ALL_ITEMS: ShopItem[] = [...SHOP_ITEMS, ...FRAME_ITEMS];

export const EMOJI_ITEM_IDS = ['emoji-angry', 'emoji-sassy', 'emoji-roses', 'emoji-smile', 'emoji-laughing', 'emoji-loser', 'emoji-bulleh'];

export const FREE_DEFAULTS = ['border-none', 'aura-none', 'frame-none'];

export const DEFAULT_EQUIPPED: Record<string, string> = {
  border: 'border-none',
  aura:   'aura-none',
  frame:  'frame-none',
};

export function getShopItem(id: string): ShopItem | undefined {
  return ALL_ITEMS.find((i) => i.id === id);
}

export type BoosterDef = {
  id: string;
  name: string;
  description: string;
  effect: string;
  img: string | null;
};

export const BOOSTER_DEFS: BoosterDef[] = [
  { id: 'coin_boost',     name: 'Coin Booster',     description: '+50% FitCoins for your next 5 workouts.',          effect: '+50% Coins × 5',    img: '/coinbooster.png' },
  { id: 'xp_boost',       name: 'XP Booster',       description: '2× XP for your next 3 workouts.',                  effect: '2× XP × 3',         img: '/XPbooster.png' },
  { id: 'fragment_boost', name: 'Fragment Booster', description: '+50% Emoji Fragments for your next 3 rewards.',    effect: '+50% Frags × 3',    img: '/fragbooster.png' },
  { id: 'emerald_boost',  name: 'Emerald Booster',  description: '+2 Emeralds from your next boss defeat.',          effect: '+2 Emeralds',        img: '/emeraldbooster.png' },
  { id: 'lucky_charm',    name: 'Lucky Charm',       description: 'Improves rarity odds of your next chest opening.', effect: 'Better Chest Loot', img: '/luckycharm.png' },
  { id: 'streak_shield',  name: 'Streak Shield',     description: 'Protects your login streak if you miss one day.',  effect: 'Shield × 1',        img: null },
];

export const BOOSTER_PRICES: Record<string, number> = {
  coin_boost:     10,
  xp_boost:       10,
  fragment_boost: 15,
  emerald_boost:  20,
  lucky_charm:    25,
  streak_shield:  30,
};

export type KeyDef = {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'premium' | 'supreme';
  img: string;
};

export const KEY_DEFS: KeyDef[] = [
  { id: 'common_key',  name: 'Common Key',  description: 'Opens a Common Chest.',  rarity: 'common',  img: '/commonkey.png'  },
  { id: 'rare_key',    name: 'Rare Key',    description: 'Opens a Rare Chest.',    rarity: 'rare',    img: '/rarekey.png'    },
  { id: 'epic_key',    name: 'Epic Key',    description: 'Opens an Epic Chest.',   rarity: 'epic',    img: '/epickey.png'    },
  { id: 'premium_key', name: 'Premium Key', description: 'Opens a Premium Chest.', rarity: 'premium', img: '/premiumkey.png' },
  { id: 'supreme_key', name: 'Supreme Key', description: 'Opens a Supreme Chest.', rarity: 'supreme', img: '/supremekey.png' },
];

export type ChestDef = {
  id: string;
  name: string;
  img: string;
  openedImg: string;
  currency: 'fitCoins' | 'emeralds';
  cost: number;
  keyId: string;
  rarity: 'common' | 'rare' | 'epic' | 'premium' | 'supreme';
};

export const CHEST_DEFS: ChestDef[] = [
  { id: 'common_chest',  name: 'Common Chest',  img: '/commonchest.png',  openedImg: '/opencommonchest.png',  currency: 'fitCoins', cost: 250,  keyId: 'common_key',  rarity: 'common'  },
  { id: 'rare_chest',    name: 'Rare Chest',    img: '/rarechest.png',    openedImg: '/openrarechest.png',    currency: 'fitCoins', cost: 500,  keyId: 'rare_key',    rarity: 'rare'    },
  { id: 'epic_chest',    name: 'Epic Chest',    img: '/epicchest.png',    openedImg: '/openepicchest.png',    currency: 'emeralds', cost: 15,   keyId: 'epic_key',    rarity: 'epic'    },
  { id: 'premium_chest', name: 'Premium Chest', img: '/premchest.png',    openedImg: '/openpremchest.png',    currency: 'emeralds', cost: 50,   keyId: 'premium_key', rarity: 'premium' },
  { id: 'supreme_chest', name: 'Supreme Chest', img: '/supremchest.png',  openedImg: '/opensupremchest.png',  currency: 'emeralds', cost: 100,  keyId: 'supreme_key', rarity: 'supreme' },
];
