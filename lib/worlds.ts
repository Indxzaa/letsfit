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
    introBg: 'linear-gradient(150deg, #2a4a1e 0%, #3a6228 30%, #2e5220 60%, #243d18 100%)',
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
    introBg: 'linear-gradient(150deg, #1a2c40 0%, #243850 30%, #1c3248 60%, #162840 100%)',
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
    introBg: 'linear-gradient(150deg, #12081e 0%, #1e0c30 30%, #180a28 60%, #100618 100%)',
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
    introBg: 'linear-gradient(150deg, #0a1a0a 0%, #122018 30%, #0e1c10 60%, #0a1608 100%)',
  },
};

export function getWorldTheme(world: number): WorldTheme {
  return WORLD_THEMES[world] ?? WORLD_THEMES[1];
}
