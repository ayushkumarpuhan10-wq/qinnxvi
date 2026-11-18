import React from 'react';
import {
  Activity,
  Award,
  Flame,
  Footprints,
  Moon,
  Play,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassIconButton } from '../components/glass/GlassIconButton';
import { GlassPlanCard } from '../components/glass/GlassPlanCard';
import { GlassProgressRing } from '../components/glass/GlassProgressRing';
import { GlassSelect } from '../components/glass/GlassSelect';
import { TypeChip } from '../components/glass/GlassBadges';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { RANK_THEMES } from '../theme/tokens';
import { DailyProgress, DayPlan } from '../types/workout';

interface HomeScreenProps {
  todayPlan: DayPlan;
  todayProgress: DailyProgress;
  summary: {
    totalItems: number;
    completedItems: number;
    missedCount: number;
    completionPct: number;
    rank: 'DEMON' | 'BEAST' | 'LOSER';
    stepsDone: boolean;
    completedExercises: number;
    totalExercises: number;
  };
  stepGoal: number;
  streak: number;
  darkSurface: boolean;
  onStartDayDetail: () => void;
  onStartWarmup: () => void;
  onStartPosture: () => void;
  onStartFinisher: () => void;
  onAddSteps: (delta: number) => void;
  onToggleMainSession: () => void;
  onToggleExtraHour: () => void;
  onRevealRank: () => void;
  pedometerStatus: string;
  onRequestPedometer: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  todayPlan,
  todayProgress,
  summary,
  stepGoal,
  streak,
  darkSurface,
  onStartDayDetail,
  onStartWarmup,
  onStartPosture,
  onStartFinisher,
  onAddSteps,
  onToggleMainSession,
  onToggleExtraHour,
  onRevealRank,
  pedometerStatus,
  onRequestPedometer,
}) => {
  const stepRatio = Math.min(1, todayProgress.steps / stepGoal);
  const rankTheme = RANK_THEMES[summary.rank];

  return (
    <div className="space-y-5 px-4 pb-28 pt-4">
      {/* Top title & streak */}
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-xs font-semibold ${darkSurface ? 'text-white/55' : 'text-[#5b6170]'}`}>
            {todayPlan.fullDay} · {todayProgress.dateISO}
          </p>
          <h1
            className={`text-[34px] font-extrabold tracking-[-0.04em] leading-tight lowercase ${
              darkSurface ? 'text-white' : 'text-[#111318]'
            }`}
          >
            today
          </h1>
        </div>

        <LiquidGlass variant="secondary" shape="diamond" className="h-14 w-14">
          <div className="flex flex-col items-center justify-center text-center text-white leading-none">
            <Flame className="h-3.5 w-3.5 text-amber-300" />
            <span className="mt-0.5 text-[10px] font-extrabold tabular-nums">{streak}d</span>
          </div>
        </LiquidGlass>
      </div>

      {/* Dual Glass Rings: Workout Completion + 10k Step Counter */}
      <div className="grid grid-cols-2 gap-3.5">
        <GlassProgressRing
          progress={summary.completionPct / 100}
          valueLabel={`${summary.completionPct}%`}
          captionLabel={`${summary.completedItems}/${summary.totalItems} checklist`}
          achieved={summary.missedCount === 0}
          accentColor="#A78BFA"
        />
        <GlassProgressRing
          progress={stepRatio}
          valueLabel={todayProgress.steps.toLocaleString()}
          captionLabel={`/ ${(stepGoal / 1000).toFixed(0)}k steps`}
          achieved={summary.stepsDone}
          accentColor="#38BDF8"
        />
      </div>

      {/* Today's Workout Hero Glass Card: Session 1 (2 hr) Arch Silhouette */}
      <GlassPlanCard
        title={`${todayPlan.day}: ${todayPlan.title} · 2 hr`}
        subtitle={
          todayPlan.isRestDay
            ? 'Active recovery day — easy walk, stretching, foam rolling.'
            : `Session 1 (2 hr): ${summary.completedExercises}/${summary.totalExercises} lifts · Session 2 (1 hr): ${todayPlan.extraHour.title}`
        }
        trainingType={todayPlan.primaryType}
        shape="arch"
      >
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TypeChip type={todayPlan.primaryType} />
          {todayPlan.secondaryType && <TypeChip type={todayPlan.secondaryType} />}
        </div>
        <div className="mt-4 space-y-2.5">
          <GlassButton
            label={todayPlan.isRestDay ? 'Open recovery plan' : 'Start 2hr workout'}
            variant="primary"
            fullWidth
            rightSlot={<Play className="h-4 w-4 fill-white" />}
            onClick={onStartDayDetail}
          />
          <GlassSelect
            label="Session 1 (2 hr): Main Workout Complete"
            sublabel={
              todayProgress.mainSessionDone
                ? '2-hour block saved offline ✓'
                : 'Tap to mark 2-hour primary block done'
            }
            selected={Boolean(todayProgress.mainSessionDone)}
            onToggle={onToggleMainSession}
            trainingType={todayPlan.primaryType}
          />
        </div>
      </GlassPlanCard>

      {/* Step Counter Controls (Circular Liquid Glass Walk Orbs + Sensor) */}
      <LiquidGlass variant="cyan" shape="squircle" active={summary.stepsDone} className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10">
              <Footprints className="h-4 w-4 text-sky-300" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Daily Steps</p>
              <p className="text-[11px] text-white/65">
                {summary.stepsDone
                  ? '10,000 target locked in'
                  : `${(stepGoal - todayProgress.steps).toLocaleString()} left · tap a step orb`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRequestPedometer}
            className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/90 hover:bg-white/20"
          >
            {pedometerStatus}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 place-items-center gap-3">
          {[
            { amt: 1500, label: '+1.5k', sub: 'walk' },
            { amt: 3500, label: '+3.5k', sub: 'brisk' },
            { amt: 5000, label: '+5.0k', sub: 'run' },
          ].map((orb) => (
            <LiquidGlass
              key={orb.amt}
              as="button"
              type="button"
              shape="circle"
              variant="cyan"
              haptic="selection"
              onClick={() => onAddSteps(orb.amt)}
              className="h-[74px] w-[74px]"
            >
              <div className="flex flex-col items-center justify-center text-center leading-tight">
                <span className="text-sm font-extrabold text-white tabular-nums">{orb.label}</span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-200/80">
                  {orb.sub}
                </span>
              </div>
            </LiquidGlass>
          ))}
        </div>
      </LiquidGlass>

      {/* Daily Guided Sequences: Square Geometric Liquid Glass Tiles + Session 2 (1 hr) */}
      <div className="space-y-3">
        <h2
          className={`text-base font-bold tracking-tight lowercase ${
            darkSurface ? 'text-white' : 'text-[#111318]'
          }`}
        >
          daily protocols
        </h2>

        <div className="grid grid-cols-3 gap-2.5">
          <LiquidGlass
            as="button"
            type="button"
            shape="square"
            variant={todayProgress.warmupDone ? 'goldGreen' : 'cyan'}
            active={todayProgress.warmupDone}
            haptic="medium"
            onClick={onStartWarmup}
            className="p-3"
          >
            <div className="flex h-full flex-col items-center justify-between text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10">
                <Sun className="h-4 w-4 text-teal-200" />
              </span>
              <div>
                <p className="text-xs font-bold text-white">Warm-up</p>
                <p className="text-[10px] text-white/70">
                  {todayProgress.warmupDone ? 'Done ✓' : '10 min'}
                </p>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass
            as="button"
            type="button"
            shape="square"
            variant={todayProgress.postureDone ? 'goldGreen' : 'primary'}
            active={todayProgress.postureDone}
            haptic="medium"
            onClick={onStartPosture}
            className="p-3"
          >
            <div className="flex h-full flex-col items-center justify-between text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10">
                <Moon className="h-4 w-4 text-sky-200" />
              </span>
              <div>
                <p className="text-xs font-bold text-white">Posture</p>
                <p className="text-[10px] text-white/70">
                  {todayProgress.postureDone ? 'Done ✓' : '12 min'}
                </p>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass
            as="button"
            type="button"
            shape="square"
            variant="goldGreen"
            active={todayProgress.staminaFinisherDone}
            haptic="heavy"
            onClick={onStartFinisher}
            className="p-3"
          >
            <div className="flex h-full flex-col items-center justify-between text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10">
                <Zap className="h-4 w-4 text-amber-300" />
              </span>
              <div>
                <p className="text-xs font-bold text-white">Stamina</p>
                <p className="text-[10px] text-white/70">
                  {todayProgress.staminaFinisherDone ? 'Done ✓' : '5 rds'}
                </p>
              </div>
            </div>
          </LiquidGlass>
        </div>

        <GlassSelect
          label={`Session 2 (1 hr): ${todayPlan.extraHour.title}`}
          sublabel={`${todayPlan.extraHour.durationLabel} · ${todayPlan.extraHour.type}`}
          selected={todayProgress.extraHourDone}
          onToggle={onToggleExtraHour}
          trainingType={todayPlan.extraHour.type}
          shape="bevel"
        />

        <GlassIconButton
          icon={<Zap className="h-4 w-4 text-amber-300" />}
          label={
            todayProgress.staminaFinisherDone
              ? 'Stamina Finisher Complete ✓'
              : 'Launch Stamina Finisher · 5 Rounds'
          }
          variant="goldGreen"
          haptic="pulse"
          onClick={onStartFinisher}
          className="w-full"
        />
      </div>

      {/* End-of-Day Rank Preview + Reveal Trigger */}
      <LiquidGlass shape="squircle" className="p-4" variant="primary">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: rankTheme.gradient }}
        />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <LiquidGlass variant="primary" shape="diamond" className="h-12 w-12 shrink-0">
              <div className="flex h-full items-center justify-center">
                <Award className="h-4 w-4" style={{ color: rankTheme.accent }} />
              </div>
            </LiquidGlass>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                Today&apos;s Rank Preview
              </span>
              <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-white">
                {summary.rank}
              </p>
              <p className="text-xs text-white/75 tabular-nums">
                {summary.missedCount} missed item{summary.missedCount === 1 ? '' : 's'} remaining
              </p>
            </div>
          </div>
          <LiquidGlass
            as="button"
            type="button"
            shape="circle"
            variant="secondary"
            haptic="rankReveal"
            onClick={onRevealRank}
            className="h-16 w-16 shrink-0"
          >
            <div className="flex flex-col items-center justify-center text-white">
              <Sparkles className="h-4 w-4" />
              <span className="mt-0.5 text-[10px] font-bold">Reveal</span>
            </div>
          </LiquidGlass>
        </div>
      </LiquidGlass>

      {/* Quick summary footer */}
      <div
        className={`flex items-center justify-center gap-2 text-[11px] ${
          darkSurface ? 'text-white/45' : 'text-[#666c7a]'
        }`}
      >
        <Activity className="h-3.5 w-3.5" />
        <span>0 missed = DEMON · 1–2 = BEAST · 3+ = LOSER</span>
      </div>
    </div>
  );
};
