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
  // Themes
  { id: 'theme-emerald',        name: 'Emerald',          description: 'The default. Clean sage green.',            type: 'theme', cost: 0,     value: 'emerald',         rarity: 'common' },
  { id: 'theme-forest-breeze',  name: 'Forest Breeze',    description: 'Warm sage and golden moss.',                type: 'theme', cost: 600,   value: 'forest-breeze',   rarity: 'common' },
  { id: 'theme-ocean-breeze',   name: 'Ocean Breeze',     description: 'Soft powder blues and teal.',               type: 'theme', cost: 750,   value: 'ocean-breeze',    rarity: 'common' },
  { id: 'theme-sakura-dream',   name: 'Sakura Dream',     description: 'Dusty rose, blush, and soft mauve.',        type: 'theme', cost: 1000,  value: 'sakura-dream',    rarity: 'common' },
  { id: 'theme-frozen-aurora',  name: 'Frozen Aurora',    description: 'Ice blue meets soft periwinkle.',           type: 'theme', cost: 2500,  value: 'frozen-aurora',   rarity: 'rare' },
  { id: 'theme-sunset-bloom',   name: 'Sunset Bloom',     description: 'Warm coral, peach, and amber.',             type: 'theme', cost: 3500,  value: 'sunset-bloom',    rarity: 'rare' },
  { id: 'theme-sacred-grove',   name: 'Sacred Grove',     description: 'Deep forest greens with golden moss.',      type: 'theme', cost: 5000,  value: 'sacred-grove',    rarity: 'rare' },
  { id: 'theme-arcane-twilight',name: 'Arcane Twilight',  description: 'Muted violet, deep indigo, and lavender.',  type: 'theme', cost: 10000, value: 'arcane-twilight', rarity: 'epic' },
  { id: 'theme-starlight-dream',name: 'Starlight Dream',  description: 'Periwinkle, silver-blue, and pale gold.',   type: 'theme', cost: 15000, value: 'starlight-dream', rarity: 'epic' },
  { id: 'theme-realm-keeper',   name: 'Realm Keeper',     description: 'Awarded for clearing the Forest Realm.',   type: 'theme', cost: 0,     value: 'realm-keeper',    rarity: 'world', requirement: 'boss-warm-up-king' },
  { id: 'theme-frost-sovereign',name: 'Frost Sovereign',  description: 'Awarded for clearing the Winter Kingdom.',  type: 'theme', cost: 0,     value: 'frost-sovereign', rarity: 'world', requirement: 'boss-the-grinder' },
  { id: 'theme-coven-master',   name: 'Coven Master',     description: 'Awarded for clearing the Witch Coven.',    type: 'theme', cost: 0,     value: 'coven-master',    rarity: 'world', requirement: 'boss-iron-wall' },
  { id: 'theme-elven-ascendant',name: 'Elven Ascendant',  description: 'Awarded for clearing the Elven Sanctuary.',type: 'theme', cost: 0,     value: 'elven-ascendant', rarity: 'world', requirement: 'boss-apex' },

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

export type AccentPalette = {
  dark: string; soft: string; secondary: string; tertiary: string;
  light: string; lightSoft: string; lightSecondary: string; lightTertiary: string;
};

export const ACCENT_THEMES: Record<string, AccentPalette> = {
  'emerald':         { dark: '#5ec97a', soft: '#86d99e', secondary: '#3daa5e', tertiary: '#b0e8c4', light: '#2e9450', lightSoft: '#5ec97a', lightSecondary: '#1e7a3e', lightTertiary: '#7dc898' },
  'forest-breeze':   { dark: '#7bb87e', soft: '#9ecba0', secondary: '#b89a54', tertiary: '#c4d8b8', light: '#4e9056', lightSoft: '#7bb87e', lightSecondary: '#987c38', lightTertiary: '#a0c0a4' },
  'ocean-breeze':    { dark: '#68b4cc', soft: '#90cade', secondary: '#5890b8', tertiary: '#b8dcec', light: '#3888a8', lightSoft: '#68b4cc', lightSecondary: '#3870a0', lightTertiary: '#90c4dc' },
  'sakura-dream':    { dark: '#d88da8', soft: '#e8adc0', secondary: '#b06890', tertiary: '#ecc8d8', light: '#b86888', lightSoft: '#d88da8', lightSecondary: '#924870', lightTertiary: '#dcacc0' },
  'frozen-aurora':   { dark: '#7ac8e8', soft: '#a4daf4', secondary: '#8898d8', tertiary: '#c4e0f4', light: '#4aaac8', lightSoft: '#7ac8e8', lightSecondary: '#6878c0', lightTertiary: '#a0ccec' },
  'sunset-bloom':    { dark: '#e09478', soft: '#ecb498', secondary: '#d87050', tertiary: '#f0cbb8', light: '#c07858', lightSoft: '#e09478', lightSecondary: '#b85838', lightTertiary: '#e8b0a0' },
  'sacred-grove':    { dark: '#72b080', soft: '#90c49c', secondary: '#c0a048', tertiary: '#c0d8b4', light: '#4e9060', lightSoft: '#72b080', lightSecondary: '#a08030', lightTertiary: '#a0c8a8' },
  'arcane-twilight': { dark: '#9480d8', soft: '#b4a0e8', secondary: '#6858b8', tertiary: '#ccc0ec', light: '#7060b8', lightSoft: '#9480d8', lightSecondary: '#5048a0', lightTertiary: '#b8a8e0' },
  'starlight-dream': { dark: '#8898d4', soft: '#acbce4', secondary: '#c4b870', tertiary: '#c8d4ec', light: '#6878bc', lightSoft: '#8898d4', lightSecondary: '#a49858', lightTertiary: '#a8bcdc' },
  'realm-keeper':    { dark: '#38d878', soft: '#60e898', secondary: '#20b858', tertiary: '#90e8c0', light: '#18a858', lightSoft: '#38d878', lightSecondary: '#108840', lightTertiary: '#68d8a0' },
  'frost-sovereign': { dark: '#4ab8f0', soft: '#74ccf8', secondary: '#6080d8', tertiary: '#b0dcf8', light: '#2898d0', lightSoft: '#4ab8f0', lightSecondary: '#4060b8', lightTertiary: '#88c8ec' },
  'coven-master':    { dark: '#bc70dc', soft: '#d490ec', secondary: '#8858cc', tertiary: '#e0b8f0', light: '#9450bc', lightSoft: '#bc70dc', lightSecondary: '#6840a8', lightTertiary: '#c898e0' },
  'elven-ascendant': { dark: '#e8b840', soft: '#f4cc68', secondary: '#c89030', tertiary: '#f4d890', light: '#c09020', lightSoft: '#e8b840', lightSecondary: '#a07018', lightTertiary: '#e8c860' },
};
