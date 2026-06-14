export type WorldTheme = {
  name: string;
  subtitle: string;
  primary: string;
  secondary: string;
  glow: string;
  battleGradient: string;
  ambientColor: string;
  particleColor: string;
  particleType: 'leaf' | 'snow' | 'rune' | 'mote';
  introBg: string;
};

export const WORLD_THEMES: Record<number, WorldTheme> = {
  1: {
    name: 'Forest Realm',
    subtitle: 'The Beginning of the Journey',
    primary: '#7ecf8a',
    secondary: '#c8b866',
    glow: '#a8d4a0',
    battleGradient: 'linear-gradient(180deg, rgba(5,18,5,0.72) 0%, rgba(0,0,0,0.05) 50%, rgba(5,20,5,0.82) 100%)',
    ambientColor: 'rgba(126,207,138,0.1)',
    particleColor: '#b8e898',
    particleType: 'leaf',
    introBg: 'linear-gradient(150deg, #071507 0%, #0e2510 20%, #1c3214 45%, #162808 70%, #071507 100%)',
  },
  2: {
    name: 'Winter Kingdom',
    subtitle: 'Where Only the Strong Endure',
    primary: '#7cc4e8',
    secondary: '#a888d8',
    glow: '#68d4c0',
    battleGradient: 'linear-gradient(180deg, rgba(4,12,26,0.75) 0%, rgba(0,0,0,0.05) 50%, rgba(4,10,22,0.85) 100%)',
    ambientColor: 'rgba(124,196,232,0.1)',
    particleColor: '#e0f4ff',
    particleType: 'snow',
    introBg: 'linear-gradient(150deg, #040e1c 0%, #0a1830 20%, #100e38 45%, #0a1428 70%, #040e1c 100%)',
  },
  3: {
    name: 'Witch Coven',
    subtitle: 'Realm of Ancient Magic',
    primary: '#b870dc',
    secondary: '#58d4c0',
    glow: '#e890b8',
    battleGradient: 'linear-gradient(180deg, rgba(10,2,22,0.78) 0%, rgba(0,0,0,0.05) 50%, rgba(8,1,18,0.88) 100%)',
    ambientColor: 'rgba(184,112,220,0.12)',
    particleColor: '#d8aff0',
    particleType: 'rune',
    introBg: 'linear-gradient(150deg, #0a0220 0%, #16042e 20%, #0c0a28 45%, #16021e 70%, #0a0220 100%)',
  },
  4: {
    name: 'Elven Sanctuary',
    subtitle: 'The Final Sacred Challenge',
    primary: '#e8c050',
    secondary: '#78d890',
    glow: '#e8a870',
    battleGradient: 'linear-gradient(180deg, rgba(16,10,0,0.72) 0%, rgba(0,0,0,0.05) 50%, rgba(10,15,2,0.82) 100%)',
    ambientColor: 'rgba(232,192,80,0.1)',
    particleColor: '#f8dca0',
    particleType: 'mote',
    introBg: 'linear-gradient(150deg, #0e0a00 0%, #1c1200 20%, #0a1800 45%, #1a0e04 70%, #0e0a00 100%)',
  },
};

export function getWorldTheme(world: number): WorldTheme {
  return WORLD_THEMES[world] ?? WORLD_THEMES[1];
}
