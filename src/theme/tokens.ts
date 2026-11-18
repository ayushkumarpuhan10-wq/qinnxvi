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

export interface TypeTheme {
  label: string;
  tintGradient: string;
  bottomGlow: string;
  causticShadow: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  accentHex: string;
}

export const TRAINING_TYPE_THEMES: Record<TrainingType, TypeTheme> = {
  Strength: {
    label: 'Strength',
    tintGradient:
      'linear-gradient(155deg, rgba(139, 92, 246, 0.34) 0%, rgba(19, 14, 34, 0.92) 55%, rgba(109, 40, 217, 0.42) 100%)',
    bottomGlow: 'rgba(139, 92, 246, 0.65)',
    causticShadow: '0 22px 34px -10px rgba(109, 40, 217, 0.55), 0 8px 16px -6px rgba(17, 19, 24, 0.45)',
    chipBg: 'rgba(139, 92, 246, 0.24)',
    chipBorder: 'rgba(196, 181, 253, 0.42)',
    chipText: '#EDE9FE',
    accentHex: '#A78BFA',
  },
  Power: {
    label: 'Power',
    tintGradient:
      'linear-gradient(155deg, rgba(239, 68, 68, 0.34) 0%, rgba(28, 12, 16, 0.92) 55%, rgba(220, 38, 38, 0.42) 100%)',
    bottomGlow: 'rgba(239, 68, 68, 0.65)',
    causticShadow: '0 22px 34px -10px rgba(220, 38, 38, 0.52), 0 8px 16px -6px rgba(17, 19, 24, 0.45)',
    chipBg: 'rgba(239, 68, 68, 0.24)',
    chipBorder: 'rgba(252, 165, 165, 0.42)',
    chipText: '#FEE2E2',
    accentHex: '#F87171',
  },
  Overall: {
    label: 'Overall / Grip',
    tintGradient:
      'linear-gradient(155deg, rgba(203, 213, 225, 0.28) 0%, rgba(12, 14, 18, 0.96) 52%, rgba(148, 163, 184, 0.34) 100%)',
    bottomGlow: 'rgba(203, 213, 225, 0.52)',
    causticShadow: '0 22px 34px -10px rgba(71, 85, 105, 0.58), 0 8px 16px -6px rgba(15, 23, 42, 0.5)',
    chipBg: 'rgba(148, 163, 184, 0.22)',
    chipBorder: 'rgba(226, 232, 240, 0.48)',
    chipText: '#F1F5F9',
    accentHex: '#CBD5E1',
  },
  Stamina: {
    label: 'Stamina',
    tintGradient:
      'linear-gradient(155deg, rgba(245, 158, 11, 0.34) 0%, rgba(26, 20, 10, 0.92) 55%, rgba(217, 119, 6, 0.45) 100%)',
    bottomGlow: 'rgba(245, 158, 11, 0.65)',
    causticShadow: '0 22px 34px -10px rgba(217, 119, 6, 0.52), 0 8px 16px -6px rgba(17, 19, 24, 0.4)',
    chipBg: 'rgba(245, 158, 11, 0.24)',
    chipBorder: 'rgba(252, 211, 77, 0.45)',
    chipText: '#FEF3C7',
    accentHex: '#FBBF24',
  },
  Endurance: {
    label: 'Endurance',
    tintGradient:
      'linear-gradient(155deg, rgba(16, 185, 129, 0.34) 0%, rgba(10, 24, 19, 0.92) 55%, rgba(5, 150, 105, 0.44) 100%)',
    bottomGlow: 'rgba(16, 185, 129, 0.65)',
    causticShadow: '0 22px 34px -10px rgba(5, 150, 105, 0.5), 0 8px 16px -6px rgba(17, 19, 24, 0.42)',
    chipBg: 'rgba(16, 185, 129, 0.24)',
    chipBorder: 'rgba(110, 231, 183, 0.42)',
    chipText: '#D1FAE5',
    accentHex: '#34D399',
  },
  Agility: {
    label: 'Agility',
    tintGradient:
      'linear-gradient(155deg, rgba(6, 182, 212, 0.34) 0%, rgba(10, 22, 28, 0.92) 55%, rgba(8, 145, 178, 0.45) 100%)',
    bottomGlow: 'rgba(6, 182, 212, 0.65)',
    causticShadow: '0 22px 34px -10px rgba(6, 182, 212, 0.52), 0 8px 16px -6px rgba(17, 19, 24, 0.42)',
    chipBg: 'rgba(6, 182, 212, 0.24)',
    chipBorder: 'rgba(103, 232, 249, 0.44)',
    chipText: '#CFFAFE',
    accentHex: '#22D3EE',
  },
  Stretch: {
    label: 'Stretch / Posture',
    tintGradient:
      'linear-gradient(155deg, rgba(226, 232, 240, 0.24) 0%, rgba(13, 24, 26, 0.9) 52%, rgba(45, 212, 191, 0.42) 100%)',
    bottomGlow: 'rgba(45, 212, 191, 0.58)',
    causticShadow: '0 22px 34px -10px rgba(20, 184, 166, 0.46), 0 8px 16px -6px rgba(17, 19, 24, 0.38)',
    chipBg: 'rgba(45, 212, 191, 0.22)',
    chipBorder: 'rgba(204, 251, 241, 0.48)',
    chipText: '#F0FDFA',
    accentHex: '#2DD4BF',
  },
};

export interface PriorityTheme {
  code: PriorityLevel;
  name: string;
  description: string;
  outlineColor: string;
  neonGlow: string;
  badgeText: string;
}

export const PRIORITY_THEMES: Record<PriorityLevel, PriorityTheme> = {
  R: {
    code: 'R',
    name: 'Red Neon',
    description: 'Main compound lifts',
    outlineColor: '#FF2A4D',
    neonGlow: '0 0 0 1.5px rgba(255, 42, 77, 0.92), 0 0 18px rgba(255, 42, 77, 0.55)',
    badgeText: '#FFD6DD',
  },
  B: {
    code: 'B',
    name: 'Blue Neon',
    description: 'Secondary lifts',
    outlineColor: '#3B82F6',
    neonGlow: '0 0 0 1.5px rgba(59, 130, 246, 0.92), 0 0 18px rgba(59, 130, 246, 0.55)',
    badgeText: '#DBEAFE',
  },
  G: {
    code: 'G',
    name: 'Green Neon',
    description: 'Accessories & finishers',
    outlineColor: '#10E88A',
    neonGlow: '0 0 0 1.5px rgba(16, 232, 138, 0.9), 0 0 16px rgba(16, 232, 138, 0.5)',
    badgeText: '#D1FAE5',
  },
};

export const RANK_THEMES: Record<
  RankTier,
  {
    title: string;
    subtitle: string;
    gradient: string;
    shadow: string;
    accent: string;
  }
> = {
  DEMON: {
    title: 'DEMON',
    subtitle: 'Zero missed items. Every rep, step, and routine locked in.',
    gradient: 'linear-gradient(155deg, rgba(220, 38, 38, 0.48) 0%, rgba(10, 10, 14, 0.97) 58%, rgba(185, 28, 28, 0.65) 100%)',
    shadow: '0 24px 44px -8px rgba(220, 38, 38, 0.65), 0 0 28px rgba(255, 42, 77, 0.45)',
    accent: '#FF2A4D',
  },
  BEAST: {
    title: 'BEAST',
    subtitle: '1–2 items missed. High output — close the remaining gap tomorrow.',
    gradient: 'linear-gradient(155deg, rgba(245, 158, 11, 0.45) 0%, rgba(20, 15, 10, 0.96) 55%, rgba(234, 88, 12, 0.58) 100%)',
    shadow: '0 24px 42px -8px rgba(245, 158, 11, 0.55)',
    accent: '#FBBF24',
  },
  LOSER: {
    title: 'LOSER',
    subtitle: '3+ items missed. Reset your focus, start with tomorrow’s warm-up.',
    gradient: 'linear-gradient(155deg, rgba(100, 116, 139, 0.34) 0%, rgba(18, 20, 26, 0.96) 60%, rgba(71, 85, 105, 0.42) 100%)',
    shadow: '0 18px 32px -10px rgba(30, 41, 59, 0.55)',
    accent: '#94A3B8',
  },
};

export const GLASS_VARIANTS = {
  primary: {
    background:
      'linear-gradient(168deg, rgba(26, 28, 38, 0.9) 0%, rgba(10, 11, 16, 0.97) 58%, rgba(24, 24, 48, 0.94) 100%)',
    bottomGlow: 'linear-gradient(90deg, rgba(79,70,229,0.55), rgba(168,85,247,0.45), rgba(59,130,246,0.5))',
    shadow: '0 22px 34px -8px rgba(17, 19, 28, 0.62), 0 12px 24px -10px rgba(79, 70, 229, 0.35)',
  },
  secondary: {
    background:
      'linear-gradient(135deg, rgba(190, 38, 118, 0.82) 0%, rgba(108, 34, 62, 0.88) 46%, rgba(234, 112, 34, 0.84) 100%)',
    bottomGlow: 'linear-gradient(90deg, rgba(236,72,153,0.9), rgba(249,115,22,0.88))',
    shadow: '0 24px 36px -8px rgba(236, 72, 153, 0.52), 0 14px 26px -10px rgba(249, 115, 22, 0.48)',
  },
  cyan: {
    background:
      'linear-gradient(165deg, rgba(16, 48, 78, 0.86) 0%, rgba(10, 18, 30, 0.95) 55%, rgba(14, 116, 144, 0.68) 100%)',
    bottomGlow: 'linear-gradient(90deg, rgba(14,165,233,0.88), rgba(59,130,246,0.78))',
    shadow: '0 22px 34px -8px rgba(14, 165, 233, 0.54), 0 10px 20px -8px rgba(15, 23, 42, 0.45)',
  },
  goldGreen: {
    background:
      'linear-gradient(135deg, rgba(138, 102, 26, 0.78) 0%, rgba(16, 36, 28, 0.94) 50%, rgba(16, 135, 92, 0.8) 100%)',
    bottomGlow: 'linear-gradient(90deg, rgba(245,158,11,0.85), rgba(16,185,129,0.85))',
    shadow: '0 22px 34px -8px rgba(16, 185, 129, 0.45), 0 14px 24px -10px rgba(245, 158, 11, 0.42)',
  },
  silver: {
    background:
      'linear-gradient(165deg, rgba(58, 63, 75, 0.76) 0%, rgba(28, 30, 38, 0.9) 55%, rgba(78, 84, 98, 0.78) 100%)',
    bottomGlow: 'linear-gradient(90deg, rgba(203,213,225,0.65), rgba(167,139,250,0.45))',
    shadow: '0 20px 30px -10px rgba(71, 85, 105, 0.48), 0 8px 18px -8px rgba(15, 23, 42, 0.35)',
  },
};
