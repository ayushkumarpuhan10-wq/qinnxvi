import React from 'react';
import {
  PRIORITY_THEMES,
  PriorityLevel,
  TRAINING_TYPE_THEMES,
  TrainingType,
} from '../../theme/tokens';

import { triggerHaptic } from '../../utils/feedback';

export const TypeChip: React.FC<{ type: TrainingType }> = ({ type }) => {
  const theme = TRAINING_TYPE_THEMES[type];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap"
      style={{
        background: theme.chipBg,
        border: `1px solid ${theme.chipBorder}`,
        color: theme.chipText,
      }}
    >
      {theme.label}
    </span>
  );
};

export const PriorityChip: React.FC<{
  priority: PriorityLevel;
  onCycle?: () => void;
}> = ({ priority, onCycle }) => {
  const p = PRIORITY_THEMES[priority];
  const Comp = onCycle ? 'button' : 'span';
  return (
    <Comp
      {...(onCycle
        ? {
            type: 'button' as const,
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              triggerHaptic('selection');
              onCycle();
            },
            title: 'Tap to cycle priority (R → B → G)',
          }
        : {})}
      className={`inline-flex items-center gap-1.5 rounded-[8px] px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap ${
        onCycle ? 'cursor-pointer hover:brightness-125 active:scale-95 transition' : ''
      }`}
      style={{
        background: 'rgba(10, 12, 18, 0.78)',
        border: `1.5px solid ${p.outlineColor}`,
        color: p.badgeText,
        boxShadow: `0 0 10px ${p.outlineColor}66`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rotate-45 rounded-[2px]"
        style={{ backgroundColor: p.outlineColor }}
      />
      {priority}
    </Comp>
  );
};

export const PriorityLegend: React.FC<{ darkSurface?: boolean }> = ({ darkSurface = false }) => {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 text-[11px] font-medium ${
        darkSurface ? 'text-white/75' : 'text-[#323643]'
      }`}
    >
      {(['R', 'B', 'G'] as PriorityLevel[]).map((code) => {
        const p = PRIORITY_THEMES[code];
        return (
          <div key={code} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rotate-45 rounded-[3px]"
              style={{
                border: `1.5px solid ${p.outlineColor}`,
                boxShadow: `0 0 8px ${p.outlineColor}`,
                background: 'rgba(10,12,18,0.9)',
              }}
            />
            <span>
              <strong>{code}</strong> {p.description}
            </span>
          </div>
        );
      })}
    </div>
  );
};
