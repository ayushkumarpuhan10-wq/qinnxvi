import React from 'react';
import { GlassShape, GlassVariant, LiquidGlass } from './LiquidGlass';
import { HapticKind } from '../../utils/feedback';

interface GlassIconButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: GlassVariant;
  shape?: GlassShape;
  haptic?: HapticKind;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'cyan',
  shape,
  haptic = 'light',
  disabled = false,
  active = false,
  className = '',
  ariaLabel,
}) => {
  if (!label) {
    return (
      <LiquidGlass
        as="button"
        onClick={onClick}
        variant={variant}
        haptic={haptic}
        disabled={disabled}
        active={active}
        shape={shape ?? 'circle'}
        ariaLabel={ariaLabel}
        className={`h-11 w-11 shrink-0 ${className}`}
      >
        <span className="flex h-11 w-11 items-center justify-center text-white">{icon}</span>
      </LiquidGlass>
    );
  }

  return (
    <LiquidGlass
      as="button"
      onClick={onClick}
      variant={variant}
      haptic={haptic}
      disabled={disabled}
      active={active}
      shape={shape ?? 'pill'}
      ariaLabel={ariaLabel ?? label}
      className={className}
    >
      <span className="flex h-[54px] items-center gap-3 pl-2 pr-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_0_14px_rgba(56,189,248,0.45)]">
          {icon}
        </span>
        <span className="text-[15px] font-medium tracking-[-0.01em] text-white whitespace-nowrap">
          {label}
        </span>
      </span>
    </LiquidGlass>
  );
};
