import React from 'react';
import { GlassShape, GlassVariant, LiquidGlass } from './LiquidGlass';
import { PriorityLevel, TrainingType } from '../../theme/tokens';
import { HapticKind } from '../../utils/feedback';

interface GlassButtonProps {
  label: string;
  onClick?: () => void;
  variant?: GlassVariant;
  shape?: GlassShape;
  haptic?: HapticKind;
  trainingType?: TrainingType;
  priority?: PriorityLevel;
  active?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rightSlot?: React.ReactNode;
  type?: 'button' | 'submit';
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  shape = 'pill',
  haptic = 'medium',
  trainingType,
  priority,
  active = false,
  disabled = false,
  fullWidth = false,
  size = 'md',
  rightSlot,
  type = 'button',
  className = '',
}) => {
  const sizeClass =
    size === 'sm'
      ? 'h-11 px-5 text-sm font-medium'
      : size === 'lg'
        ? 'h-14 px-7 text-[16px] font-semibold'
        : 'h-[54px] px-6 text-[15px] font-medium';

  return (
    <LiquidGlass
      as="button"
      type={type}
      onClick={onClick}
      variant={variant}
      haptic={haptic}
      trainingType={trainingType}
      priority={priority}
      active={active}
      disabled={disabled}
      shape={shape}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <span className={`flex items-center justify-center gap-2.5 whitespace-nowrap ${sizeClass}`}>
        <span className="tracking-[-0.01em]">{label}</span>
        {rightSlot}
      </span>
    </LiquidGlass>
  );
};
