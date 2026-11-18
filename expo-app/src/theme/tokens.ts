export type TrainingType =
  | 'Strength'
  | 'Power'
  | 'Overall'
  | 'Stamina'
  | 'Endurance'
  | 'Agility'
  | 'Stretch';

export type PriorityLevel = 'R' | 'B' | 'G';
export type RankTier = 'DEMON' | 'BEAST' | 'LOSER';

export const TYPE_TOKENS: Record<
  TrainingType,
  {
    label: string;
    tint: [string, string, string];
    glow: string;
    chipBg: string;
    chipBorder: string;
  }
> = {
  Strength: {
    label: 'Strength',
    tint: ['rgba(139,92,246,0.34)', 'rgba(17,14,30,0.92)', 'rgba(109,40,217,0.42)'],
    glow: '#8B5CF6',
    chipBg: 'rgba(139,92,246,0.28)',
    chipBorder: 'rgba(196,181,253,0.45)',
  },
  Power: {
    label: 'Power',
    tint: ['rgba(239,68,68,0.34)', 'rgba(26,12,16,0.92)', 'rgba(220,38,38,0.42)'],
    glow: '#EF4444',
    chipBg: 'rgba(239,68,68,0.28)',
    chipBorder: 'rgba(252,165,165,0.45)',
  },
  Overall: {
    label: 'Overall / Grip',
    tint: ['rgba(203,213,225,0.28)', 'rgba(12,14,18,0.96)', 'rgba(148,163,184,0.34)'],
    glow: '#94A3B8',
    chipBg: 'rgba(148,163,184,0.24)',
    chipBorder: 'rgba(226,232,240,0.5)',
  },
  Stamina: {
    label: 'Stamina',
    tint: ['rgba(245,158,11,0.34)', 'rgba(24,18,10,0.92)', 'rgba(217,119,6,0.45)'],
    glow: '#F59E0B',
    chipBg: 'rgba(245,158,11,0.28)',
    chipBorder: 'rgba(252,211,77,0.45)',
  },
  Endurance: {
    label: 'Endurance',
    tint: ['rgba(16,185,129,0.34)', 'rgba(10,22,18,0.92)', 'rgba(5,150,105,0.44)'],
    glow: '#10B981',
    chipBg: 'rgba(16,185,129,0.28)',
    chipBorder: 'rgba(110,231,183,0.45)',
  },
  Agility: {
    label: 'Agility',
    tint: ['rgba(6,182,212,0.34)', 'rgba(10,20,26,0.92)', 'rgba(8,145,178,0.45)'],
    glow: '#06B6D4',
    chipBg: 'rgba(6,182,212,0.28)',
    chipBorder: 'rgba(103,232,249,0.45)',
  },
  Stretch: {
    label: 'Stretch / Posture',
    tint: ['rgba(226,232,240,0.24)', 'rgba(13,24,26,0.9)', 'rgba(45,212,191,0.42)'],
    glow: '#2DD4BF',
    chipBg: 'rgba(45,212,191,0.24)',
    chipBorder: 'rgba(204,251,241,0.48)',
  },
};

export const PRIORITY_TOKENS: Record<
  PriorityLevel,
  { color: string; label: string }
> = {
  R: { color: '#FF2A4D', label: 'Main compound lifts' },
  B: { color: '#3B82F6', label: 'Secondary lifts' },
  G: { color: '#10E88A', label: 'Accessories & finishers' },
};

export const GLASS_PRESETS = {
  primary: {
    colors: ['rgba(30,32,42,0.92)', 'rgba(10,11,16,0.97)', 'rgba(22,24,44,0.94)'] as [string, string, string],
    shadowColor: '#4F46E5',
  },
  secondary: {
    colors: ['rgba(190,38,118,0.85)', 'rgba(108,34,62,0.9)', 'rgba(234,112,34,0.86)'] as [string, string, string],
    shadowColor: '#EC4899',
  },
  cyan: {
    colors: ['rgba(16,48,78,0.88)', 'rgba(10,18,30,0.95)', 'rgba(14,116,144,0.72)'] as [string, string, string],
    shadowColor: '#0EA5E9',
  },
  goldGreen: {
    colors: ['rgba(138,102,26,0.8)', 'rgba(16,36,28,0.94)', 'rgba(16,135,92,0.82)'] as [string, string, string],
    shadowColor: '#10B981',
  },
  silver: {
    colors: ['rgba(58,63,75,0.8)', 'rgba(26,28,36,0.92)', 'rgba(78,84,98,0.82)'] as [string, string, string],
    shadowColor: '#94A3B8',
  },
};
