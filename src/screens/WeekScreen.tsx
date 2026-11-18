import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { DAY_ORDER } from '../data/program';
import { GlassTabsCard } from '../components/glass/GlassTabsCard';
import { GlassPlanCard } from '../components/glass/GlassPlanCard';
import { PriorityLegend, TypeChip } from '../components/glass/GlassBadges';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { DayKey, DayPlan } from '../types/workout';
import { triggerHaptic } from '../utils/feedback';

interface WeekScreenProps {
  plan: Record<DayKey, DayPlan>;
  selectedDay: DayKey;
  todayDayKey: DayKey;
  darkSurface: boolean;
  onSelectDay: (day: DayKey) => void;
  onOpenDayDetail: (day: DayKey) => void;
}

export const WeekScreen: React.FC<WeekScreenProps> = ({
  plan,
  selectedDay,
  todayDayKey,
  darkSurface,
  onSelectDay,
  onOpenDayDetail,
}) => {
  const [viewMode, setViewMode] = useState<'tabs' | 'all'>('tabs');

  return (
    <div className="space-y-5 px-4 pb-28 pt-4">
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-xs font-semibold ${darkSurface ? 'text-white/55' : 'text-[#5b6170]'}`}>
            7-day split · Mon–Sun
          </p>
          <h1
            className={`text-[34px] font-extrabold tracking-[-0.04em] leading-tight lowercase ${
              darkSurface ? 'text-white' : 'text-[#111318]'
            }`}
          >
            week view
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('tabSnap');
            setViewMode((m) => (m === 'tabs' ? 'all' : 'tabs'));
          }}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            darkSurface
              ? 'bg-white/12 text-white hover:bg-white/20'
              : 'bg-black/8 text-[#111318] hover:bg-black/14'
          }`}
        >
          {viewMode === 'tabs' ? 'Show all 7' : 'Tabs card'}
        </button>
      </div>

      {/* 7-Day Square Geometric Liquid Glass Ribbon */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_ORDER.map((d) => {
          const dp = plan[d];
          const isSelected = d === selectedDay;
          const isToday = d === todayDayKey;
          return (
            <LiquidGlass
              key={d}
              as="button"
              type="button"
              shape={dp.isRestDay ? 'circle' : 'square'}
              trainingType={isSelected ? dp.primaryType : undefined}
              variant={isSelected ? 'secondary' : 'primary'}
              active={isSelected}
              haptic="selection"
              onClick={() => onSelectDay(d)}
              className="p-1.5"
            >
              <div className="flex h-full flex-col items-center justify-center text-center leading-none">
                <span className="text-[11px] font-extrabold text-white">{d}</span>
                <span
                  className={`mt-1 h-1.5 w-1.5 rounded-full ${
                    isToday ? 'bg-emerald-300 shadow-[0_0_6px_#34d399]' : 'bg-white/25'
                  }`}
                />
              </div>
            </LiquidGlass>
          );
        })}
      </div>

      {/* Liquid Glass Tabs Card Mon–Sun */}
      {viewMode === 'tabs' ? (
        <GlassTabsCard
          title="Weekly Schedule"
          shape="squircle"
          activeTabId={selectedDay}
          onSelectTab={(id) => onSelectDay(id as DayKey)}
          tabs={DAY_ORDER.map((d) => ({
            id: d,
            label: `${d === todayDayKey ? '● ' : ''}${plan[d].fullDay} — ${plan[d].title}`,
            sublabel: `${plan[d].exercises.length}ex`,
          }))}
        />
      ) : null}

      {/* Selected Day Preview (Arch for active training, Bevel for Rest/Recovery) */}
      <div className="space-y-3.5">
        {(viewMode === 'all' ? DAY_ORDER : [selectedDay]).map((dayKey) => {
          const dp = plan[dayKey];
          return (
            <GlassPlanCard
              key={dayKey}
              title={`${dp.day}: ${dp.title}`}
              subtitle={`Session 2 (1 hr): ${dp.extraHour.title} (${dp.extraHour.durationLabel})`}
              footerLeft={`${dp.exercises.length} exercises · 2 hr + 1 hr`}
              footerRight={dayKey === todayDayKey ? 'TODAY' : 'OPEN →'}
              trainingType={dp.primaryType}
              shape={dp.isRestDay ? 'bevel' : 'arch'}
              haptic="medium"
              active={dayKey === todayDayKey}
              onClick={() => onOpenDayDetail(dayKey)}
            >
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <TypeChip type={dp.primaryType} />
                  {dp.secondaryType && <TypeChip type={dp.secondaryType} />}
                </div>
                <ChevronRight className="h-4 w-4 text-white/75" />
              </div>
            </GlassPlanCard>
          );
        })}
      </div>

      <PriorityLegend darkSurface={darkSurface} />
    </div>
  );
};
