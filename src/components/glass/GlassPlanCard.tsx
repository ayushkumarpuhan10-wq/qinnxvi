import React from 'react';
import { GlassShape, LiquidGlass } from './LiquidGlass';
import { PriorityLevel, TrainingType } from '../../theme/tokens';
import { HapticKind } from '../../utils/feedback';

interface GlassPlanCardProps {
  title: string;
  subtitle?: string;
  footerLeft?: string;
  footerRight?: string | number;
  trainingType?: TrainingType;
  priority?: PriorityLevel;
  shape?: GlassShape;
  haptic?: HapticKind;
  onClick?: () => void;
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const GlassPlanCard: React.FC<GlassPlanCardProps> = ({
  title,
  subtitle,
  footerLeft,
  footerRight,
  trainingType,
  priority,
  shape = 'card',
  haptic = 'light',
  onClick,
  active = false,
  children,
  className = '',
}) => {
  return (
    <LiquidGlass
      as={onClick ? 'button' : 'div'}
      onClick={onClick}
      variant="cyan"
      trainingType={trainingType}
      priority={priority}
      active={active}
      shape={shape}
      haptic={haptic}
      className={`text-left ${className}`}
    >
      {/* Signature pink/violet top-right inner refraction from reference Pro plan card */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full blur-xl opacity-45"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.75), transparent 70%)' }}
      />
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-white">{title}</h3>
        </div>
        {subtitle && <p className="mt-2.5 text-[13px] leading-snug text-white/75">{subtitle}</p>}
        {children}
        {(footerLeft !== undefined || footerRight !== undefined) && (
          <div className="mt-3 flex items-center justify-between text-[13px] text-white/85">
            <span>{footerLeft}</span>
            <span className="font-semibold tabular-nums">{footerRight}</span>
          </div>
        )}
      </div>
    </LiquidGlass>
  );
};
