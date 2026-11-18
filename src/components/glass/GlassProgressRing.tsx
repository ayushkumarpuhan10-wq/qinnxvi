import React from 'react';
import { LiquidGlass } from './LiquidGlass';

interface GlassProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  valueLabel: string;
  captionLabel: string;
  achieved?: boolean;
  accentColor?: string;
}

export const GlassProgressRing: React.FC<GlassProgressRingProps> = ({
  progress,
  size = 118,
  strokeWidth = 9,
  valueLabel,
  captionLabel,
  achieved = false,
  accentColor = '#38BDF8',
}) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - clamped);
  const gradId = React.useId();

  return (
    <LiquidGlass
      variant={achieved ? 'goldGreen' : 'primary'}
      shape="card"
      active={achieved}
      className="flex flex-col items-center justify-center p-3"
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              {achieved ? (
                <>
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#10E88A" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor={accentColor} />
                  <stop offset="100%" stopColor="#A78BFA" />
                </>
              )}
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 450ms cubic-bezier(0.22, 1, 0.36, 1)',
              filter: achieved
                ? 'drop-shadow(0 0 10px rgba(16, 232, 138, 0.7))'
                : `drop-shadow(0 0 8px ${accentColor}88)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <span className="text-[19px] font-bold tracking-tight text-white tabular-nums leading-none">
            {valueLabel}
          </span>
          <span className="mt-1 text-[10px] font-medium text-white/65 leading-tight">
            {captionLabel}
          </span>
        </div>
      </div>
    </LiquidGlass>
  );
};
