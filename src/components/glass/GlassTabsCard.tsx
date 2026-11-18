import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { GlassShape, LiquidGlass } from './LiquidGlass';
import { triggerHaptic } from '../../utils/feedback';

export interface TabOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface GlassTabsCardProps {
  title?: string;
  onBack?: () => void;
  tabs: TabOption[];
  activeTabId?: string;
  onSelectTab: (id: string) => void;
  shape?: GlassShape;
  className?: string;
}

export const GlassTabsCard: React.FC<GlassTabsCardProps> = ({
  title = 'Tabs',
  onBack,
  tabs,
  activeTabId,
  onSelectTab,
  shape = 'card',
  className = '',
}) => {
  return (
    <LiquidGlass variant="primary" shape={shape} className={className}>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2 text-white">
          {onBack ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onBack();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 active:scale-95"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <ChevronLeft className="h-4 w-4 text-white/80" />
          )}
          <span className="text-[15px] font-medium tracking-[-0.01em]">{title}</span>
        </div>
        <div className="space-y-1.5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic('tabSnap');
                  onSelectTab(tab.id);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[14px] transition ${
                  isActive
                    ? 'bg-white/14 font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.28)]'
                    : 'font-normal text-white/85 hover:bg-white/8 hover:text-white'
                }`}
              >
                <span className="truncate">{tab.label}</span>
                {tab.sublabel && (
                  <span className="ml-2 shrink-0 text-xs text-white/55 tabular-nums">
                    {tab.sublabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </LiquidGlass>
  );
};
