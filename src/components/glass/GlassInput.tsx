import React from 'react';
import { Search } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';

interface GlassInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  onSubmit?: () => void;
  type?: 'text' | 'number' | 'password';
  error?: boolean;
  shake?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChange,
  placeholder = 'Text field',
  rightIcon,
  onRightIconClick,
  onSubmit,
  type = 'text',
  error = false,
  shake = false,
  disabled = false,
  autoFocus = false,
  className = '',
  inputClassName = '',
  ariaLabel,
}) => {
  return (
    <div className={shake ? 'animate-lg-shake' : ''}>
      <LiquidGlass
        variant="silver"
        shape="pill"
        errorGlow={error}
        disabled={disabled}
        className={className}
      >
        <div className="flex h-[54px] items-center px-2.5">
          <div className="flex h-10 flex-1 items-center rounded-full bg-black/30 px-4 shadow-[inset_0_2px_5px_rgba(0,0,0,0.45)]">
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSubmit) onSubmit();
              }}
              placeholder={placeholder}
              autoFocus={autoFocus}
              disabled={disabled}
              aria-label={ariaLabel ?? placeholder}
              className={`w-full bg-transparent text-[15px] font-medium text-white placeholder:text-white/75 focus:outline-none ${inputClassName}`}
            />
          </div>
          <button
            type="button"
            onClick={onRightIconClick ?? onSubmit}
            aria-label="Action"
            className="ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 active:scale-95"
          >
            {rightIcon ?? <Search className="h-5 w-5" strokeWidth={2} />}
          </button>
        </div>
      </LiquidGlass>
    </div>
  );
};
