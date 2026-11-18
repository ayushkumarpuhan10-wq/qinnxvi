import React from 'react';
import { motion } from 'motion/react';
import { LiquidGlass } from './LiquidGlass';

interface GlassSwitchProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const GlassSwitch: React.FC<GlassSwitchProps> = ({
  label,
  sublabel,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <LiquidGlass
      as="button"
      onClick={() => onChange(!checked)}
      variant="primary"
      haptic={checked ? 'toggleOff' : 'toggleOn'}
      active={checked}
      disabled={disabled}
      shape="pill"
      className={`w-full ${className}`}
    >
      <div className="flex min-h-[54px] items-center justify-between gap-3 pl-5 pr-2.5 py-2">
        <div className="min-w-0 text-left">
          <p className="truncate text-[15px] font-medium text-white">{label}</p>
          {sublabel && <p className="truncate text-[11px] text-white/65">{sublabel}</p>}
        </div>
        <div
          className="relative flex h-9 w-[68px] shrink-0 items-center rounded-full p-1 transition-all duration-200"
          style={{
            background: checked
              ? 'linear-gradient(90deg, rgba(29, 78, 216, 0.92) 0%, rgba(79, 70, 229, 0.92) 100%)'
              : 'rgba(255, 255, 255, 0.12)',
            boxShadow: checked
              ? 'inset 0 2px 6px rgba(0, 0, 0, 0.45), 0 0 16px rgba(59, 130, 246, 0.65)'
              : 'inset 0 2px 5px rgba(0, 0, 0, 0.5)',
          }}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 520, damping: 32 }}
            className="block h-7 w-7 rounded-full"
            style={{
              marginLeft: checked ? 'auto' : 0,
              background:
                'radial-gradient(circle at 35% 30%, #ffffff 0%, #eef2ff 55%, #cbd5e1 100%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45), inset 0 -2px 3px rgba(148, 163, 184, 0.5)',
            }}
          />
        </div>
      </div>
    </LiquidGlass>
  );
};
