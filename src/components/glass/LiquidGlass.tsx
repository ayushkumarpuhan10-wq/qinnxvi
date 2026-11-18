import React from 'react';
import { motion } from 'motion/react';
import {
  GLASS_VARIANTS,
  PRIORITY_THEMES,
  PriorityLevel,
  TRAINING_TYPE_THEMES,
  TrainingType,
} from '../../theme/tokens';
import { HapticKind, triggerHaptic } from '../../utils/feedback';

export type GlassVariant = keyof typeof GLASS_VARIANTS;
export type GlassShape =
  | 'pill'
  | 'card'
  | 'circle'
  | 'square'
  | 'squircle'
  | 'diamond'
  | 'arch'
  | 'bevel';

export interface LiquidGlassProps {
  children: React.ReactNode;
  variant?: GlassVariant;
  trainingType?: TrainingType;
  priority?: PriorityLevel;
  shape?: GlassShape;
  active?: boolean;
  disabled?: boolean;
  errorGlow?: boolean;
  haptic?: HapticKind;
  pressHaptic?: HapticKind;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  as?: 'div' | 'button';
  type?: 'button' | 'submit';
  ariaLabel?: string;
}

const SHAPE_CLASSES: Record<GlassShape, string> = {
  pill: 'rounded-full',
  card: 'rounded-[24px]',
  circle: 'rounded-full aspect-square flex items-center justify-center',
  square: 'rounded-[18px] aspect-square',
  squircle: 'rounded-[32px]',
  diamond: 'rounded-[18px] rotate-45 aspect-square flex items-center justify-center',
  arch: 'rounded-t-[38px] rounded-b-[16px]',
  bevel: 'rounded-tl-[28px] rounded-br-[28px] rounded-tr-[10px] rounded-bl-[10px]',
};

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  variant = 'primary',
  trainingType,
  priority,
  shape = 'pill',
  active = false,
  disabled = false,
  errorGlow = false,
  haptic = 'tap',
  pressHaptic = 'tick',
  className = '',
  onClick,
  as = onClick ? 'button' : 'div',
  type = 'button',
  ariaLabel,
}) => {
  const baseVariant = GLASS_VARIANTS[variant];
  const typeTheme = trainingType ? TRAINING_TYPE_THEMES[trainingType] : null;
  const priorityTheme = priority ? PRIORITY_THEMES[priority] : null;

  const background = typeTheme ? typeTheme.tintGradient : baseVariant.background;

  let boxShadow = typeTheme ? typeTheme.causticShadow : baseVariant.shadow;
  if (priorityTheme) {
    boxShadow = `${priorityTheme.neonGlow}, ${boxShadow}`;
  }
  if (errorGlow) {
    boxShadow = `0 0 0 2px rgba(255, 42, 77, 0.95), 0 18px 34px -6px rgba(239, 68, 68, 0.65)`;
  }

  const shapeClass = SHAPE_CLASSES[shape];
  const bottomGlowStyle = typeTheme
    ? `linear-gradient(90deg, transparent 4%, ${typeTheme.bottomGlow} 50%, transparent 96%)`
    : baseVariant.bottomGlow;

  const sharedClasses = [
    'lg-glass-shell relative overflow-hidden select-none text-white',
    shapeClass,
    as === 'button'
      ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80'
      : '',
    disabled ? 'opacity-45 pointer-events-none grayscale-[30%]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handlePointerDown = () => {
    if (disabled || as !== 'button') return;
    triggerHaptic(pressHaptic);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    triggerHaptic(haptic);
    onClick?.(e);
  };

  const innerContent = (
    <>
      {/* Top specular meniscus highlight */}
      <span className="lg-specular-sheen" aria-hidden="true" />
      {/* Secondary diagonal refraction lens flare */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-6 -top-6 h-16 w-24 rounded-full bg-white/15 blur-md"
      />
      {/* Corner refractive glint */}
      <span className="lg-corner-glint" aria-hidden="true" />
      {/* Soft gradient glow bleeding from bottom edge */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-3 bottom-0 h-[11px] rounded-full blur-[6px] opacity-90 ${
          active ? 'animate-lg-glow' : ''
        }`}
        style={{ background: bottomGlowStyle }}
      />
      {/* Active edge halo */}
      {active && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/50"
        />
      )}
      <div className={`relative z-10 w-full ${shape === 'diamond' ? '-rotate-45' : ''}`}>
        {children}
      </div>
    </>
  );

  if (as === 'button') {
    return (
      <motion.button
        type={type}
        aria-label={ariaLabel}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        whileHover={disabled ? undefined : { scale: 1.022, y: -1.5 }}
        whileTap={disabled ? undefined : { scale: 0.95, y: 1.5 }}
        transition={{ type: 'spring', stiffness: 520, damping: 24 }}
        className={sharedClasses}
        style={{ background, boxShadow }}
      >
        {innerContent}
      </motion.button>
    );
  }

  return (
    <motion.div
      className={sharedClasses}
      style={{ background, boxShadow }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      {innerContent}
    </motion.div>
  );
};
