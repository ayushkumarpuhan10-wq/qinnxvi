import React from 'react';
import { ArrowLeft, Edit3, Play } from 'lucide-react';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassIconButton } from '../components/glass/GlassIconButton';
import { GlassSelect } from '../components/glass/GlassSelect';
import { PriorityChip, PriorityLegend, TypeChip } from '../components/glass/GlassBadges';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { DailyProgress, DayKey, DayPlan, ExerciseItem } from '../types/workout';

interface DayDetailScreenProps {
  dayPlan: DayPlan;
  progress: DailyProgress;
  darkSurface: boolean;
  onBack: () => void;
  onStartFirstIncomplete: () => void;
  onOpenExercise: (exercise: ExerciseItem) => void;
  onToggleExercise: (exercise: ExerciseItem) => void;
  onCyclePriority: (dayKey: DayKey, exerciseId: string) => void;
  onToggleExtraHour: () => void;
  onOpenPlanEditor: () => void;
}

import { triggerHaptic } from '../utils/feedback';

export const DayDetailScreen: React.FC<DayDetailScreenProps> = ({
  dayPlan,
  progress,
  darkSurface,
  onBack,
  onStartFirstIncomplete,
  onOpenExercise,
  onToggleExercise,
  onCyclePriority,
  onToggleExtraHour,
  onOpenPlanEditor,
}) => {
  const completedCount = dayPlan.exercises.filter((e) => progress.exercises[e.id]?.completed).length;

  return (
    <div className="space-y-4 px-4 pb-28 pt-4">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        <GlassIconButton
          icon={<ArrowLeft className="h-4.5 w-4.5" />}
          variant="primary"
          shape="circle"
          onClick={onBack}
          ariaLabel="Back"
        />
        <div className="text-center">
          <p className={`text-[11px] font-semibold uppercase ${darkSurface ? 'text-white/55' : 'text-[#5b6170]'}`}>
            {dayPlan.fullDay}
          </p>
          <p className={`text-sm font-bold ${darkSurface ? 'text-white' : 'text-[#111318]'}`}>
            {completedCount}/{dayPlan.exercises.length} done
          </p>
        </div>
        <GlassIconButton
          icon={<Edit3 className="h-4 w-4" />}
          variant="cyan"
          shape="square"
          onClick={onOpenPlanEditor}
          ariaLabel="Edit Plan"
        />
      </div>

      {/* Header */}
      <div>
        <h1
          className={`text-[28px] font-extrabold tracking-[-0.03em] leading-tight lowercase ${
            darkSurface ? 'text-white' : 'text-[#111318]'
          }`}
        >
          {dayPlan.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <PriorityLegend darkSurface={darkSurface} />
        </div>
      </div>

      {/* Primary Start Button */}
      <GlassButton
        label="Start 2hr session"
        variant="secondary"
        haptic="heavy"
        fullWidth
        rightSlot={<Play className="h-4 w-4 fill-white" />}
        onClick={onStartFirstIncomplete}
      />

      {/* Exercise List (Arch = [R] Main Compound, Card = [B] Secondary, Bevel = [G] Accessory) */}
      <div className="space-y-3">
        {dayPlan.exercises.map((ex, index) => {
          const isDone = progress.exercises[ex.id]?.completed ?? false;
          const shape = ex.priority === 'R' ? 'arch' : ex.priority === 'B' ? 'card' : 'bevel';
          return (
            <LiquidGlass
              key={ex.id}
              trainingType={ex.type}
              priority={ex.priority}
              shape={shape}
              active={isDone}
              className="p-3.5"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-white/55 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <TypeChip type={ex.type} />
                    {ex.secondaryType && <TypeChip type={ex.secondaryType} />}
                    <PriorityChip
                      priority={ex.priority}
                      onCycle={() => onCyclePriority(dayPlan.day, ex.id)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      onOpenExercise(ex);
                    }}
                    className="mt-2 block w-full text-left"
                  >
                    <h3 className="text-[16px] font-bold text-white">{ex.name}</h3>
                    <p className="mt-0.5 text-xs text-white/75 tabular-nums">
                      {ex.sets} × {ex.reps} · {ex.muscles}
                    </p>
                    <p className="mt-1 text-[11px] text-white/55">
                      Timer: {ex.timer.mode === 'interval'
                        ? `${ex.timer.rounds}× ${ex.timer.durationSec}s on / ${ex.timer.restSec}s off`
                        : ex.timer.mode === 'countdown'
                          ? `${ex.timer.durationSec}s countdown`
                          : `${ex.timer.durationSec}s rest`}
                      {' · '}Tap card to track sets
                    </p>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleExercise(ex)}
                  aria-label={`Mark ${ex.name} complete`}
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center border text-sm font-bold transition active:scale-90 ${
                    ex.priority === 'R' ? 'rounded-full' : 'rounded-[13px]'
                  } ${
                    isDone
                      ? 'border-white/70 bg-white/25 text-white shadow-[0_0_16px_rgba(255,255,255,0.4)]'
                      : 'border-white/30 bg-black/35 text-white/45 hover:bg-white/10'
                  }`}
                >
                  ✓
                </button>
              </div>
            </LiquidGlass>
          );
        })}
      </div>

      {/* Session 2 (1 hr) Card */}
      <div className="pt-2">
        <GlassSelect
          label={`Session 2 (1 hr): ${dayPlan.extraHour.title}`}
          sublabel={`${dayPlan.extraHour.durationLabel} · ${dayPlan.extraHour.type}`}
          selected={progress.extraHourDone}
          onToggle={onToggleExtraHour}
          trainingType={dayPlan.extraHour.type}
          shape="bevel"
        />
      </div>
    </div>
  );
};
