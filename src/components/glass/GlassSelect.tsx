import React from 'react';
import { Check } from 'lucide-react';
import { GlassShape, LiquidGlass } from './LiquidGlass';
import { PriorityLevel, TrainingType } from '../../theme/tokens';

interface GlassSelectProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onToggle: () => void;
  trainingType?: TrainingType;
  priority?: PriorityLevel;
  shape?: GlassShape;
  disabled?: boolean;
  className?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  sublabel,
  selected,
  onToggle,
  trainingType,
  priority,
  shape = 'pill',
  disabled = false,
  className = '',
}) => {
  return (
    <LiquidGlass
      as="button"
      onClick={onToggle}
      variant="goldGreen"
      trainingType={trainingType}
      priority={priority}
      haptic={selected ? 'toggleOff' : 'toggleOn'}
      active={selected}
      disabled={disabled}
      shape={shape}
      className={`w-full ${className}`}
    >
      <div className="flex min-h-[54px] items-center justify-between gap-3 px-5 py-2.5">
        <div className="min-w-0 text-left">
          <p className="truncate text-[15px] font-medium text-white">{label}</p>
          {sublabel && <p className="truncate text-xs text-white/70">{sublabel}</p>}
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border transition-all ${
            selected
              ? 'border-white/60 bg-white/25 text-white shadow-[0_0_14px_rgba(255,255,255,0.35)]'
              : 'border-white/30 bg-black/35 text-white/40'
          }`}
        >
          <Check className="h-4.5 w-4.5" strokeWidth={2.4} />
        </span>
      </div>
    </LiquidGlass>
  );
};
