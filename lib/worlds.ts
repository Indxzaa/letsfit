export type WorldTheme = {
  name: string;
  subtitle: string;
  primary: string;
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
    primary: '#22c55e',
    battleGradient: 'linear-gradient(180deg, rgba(5,18,5,0.72) 0%, rgba(0,0,0,0.05) 50%, rgba(5,20,5,0.82) 100%)',
    ambientColor: 'rgba(34,197,94,0.09)',
    particleColor: '#4ade80',
    particleType: 'leaf',
    introBg: 'linear-gradient(135deg, #0a1a0a 0%, #142814 50%, #0a1a0a 100%)',
  },
  2: {
    name: 'Winter Kingdom',
    subtitle: 'Where Only the Strong Endure',
    primary: '#60a5fa',
    battleGradient: 'linear-gradient(180deg, rgba(4,12,26,0.75) 0%, rgba(0,0,0,0.05) 50%, rgba(4,10,22,0.85) 100%)',
    ambientColor: 'rgba(96,165,250,0.09)',
    particleColor: '#e0f2fe',
    particleType: 'snow',
    introBg: 'linear-gradient(135deg, #060e1c 0%, #0c1e38 50%, #060e1c 100%)',
  },
  3: {
    name: 'Witch Coven',
    subtitle: 'Realm of Ancient Magic',
    primary: '#a855f7',
    battleGradient: 'linear-gradient(180deg, rgba(10,2,22,0.78) 0%, rgba(0,0,0,0.05) 50%, rgba(8,1,18,0.88) 100%)',
    ambientColor: 'rgba(168,85,247,0.11)',
    particleColor: '#d8b4fe',
    particleType: 'rune',
    introBg: 'linear-gradient(135deg, #0c0320 0%, #1e0640 50%, #0c0320 100%)',
  },
  4: {
    name: 'Elven Sanctuary',
    subtitle: 'The Final Sacred Challenge',
    primary: '#f59e0b',
    battleGradient: 'linear-gradient(180deg, rgba(16,10,0,0.72) 0%, rgba(0,0,0,0.05) 50%, rgba(10,15,2,0.82) 100%)',
    ambientColor: 'rgba(245,158,11,0.09)',
    particleColor: '#fde68a',
    particleType: 'mote',
    introBg: 'linear-gradient(135deg, #120c00 0%, #1f1500 30%, #081200 70%, #120c00 100%)',
  },
};

export function getWorldTheme(world: number): WorldTheme {
  return WORLD_THEMES[world] ?? WORLD_THEMES[1];
}
