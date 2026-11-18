import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassIconButton } from '../components/glass/GlassIconButton';
import { PriorityChip, TypeChip } from '../components/glass/GlassBadges';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { playTimerChime, sendLocalNotification, triggerHaptic } from '../utils/feedback';
import { ExerciseItem, ExerciseLog, SetLog } from '../types/workout';

interface ExerciseScreenProps {
  exercise: ExerciseItem;
  log?: ExerciseLog;
  units: 'kg' | 'lbs';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  restAlertsEnabled: boolean;
  darkSurface: boolean;
  onBack: () => void;
  onUpdateSet: (setIndex: number, patch: Partial<SetLog>) => void;
  onNextExercise?: () => void;
  onNotify?: (
    title: string,
    message: string,
    tone?: 'celebrate' | 'boost' | 'hydration' | 'timer' | 'rank' | 'info',
    alsoBrowser?: boolean
  ) => void;
}

export const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  exercise,
  log,
  units,
  soundEnabled,
  hapticsEnabled,
  restAlertsEnabled,
  darkSurface,
  onBack,
  onUpdateSet,
  onNextExercise,
  onNotify,
}) => {
  const timerCfg = exercise.timer;
  const isInterval = timerCfg.mode === 'interval';

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'work' | 'rest'>(isInterval ? 'work' : 'work');
  const [round, setRound] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(timerCfg.durationSec);
  const endTimestampRef = useRef<number | null>(null);

  // Reset timer cleanly when switching exercises
  useEffect(() => {
    setRunning(false);
    setPhase('work');
    setRound(1);
    setSecondsLeft(exercise.timer.durationSec);
    endTimestampRef.current = null;
  }, [exercise.id, exercise.timer.durationSec]);

  // Background-resilient timestamp-based timer loop
  useEffect(() => {
    if (!running) {
      endTimestampRef.current = null;
      return;
    }

    if (!endTimestampRef.current) {
      endTimestampRef.current = Date.now() + secondsLeft * 1000;
    }

    let lastTickedSec = -1;
    const tick = () => {
      if (!endTimestampRef.current) return;
      const diffMs = endTimestampRef.current - Date.now();
      const remaining = Math.max(0, Math.ceil(diffMs / 1000));
      setSecondsLeft(remaining);

      if (remaining > 0 && remaining <= 3 && remaining !== lastTickedSec) {
        lastTickedSec = remaining;
        triggerHaptic('tick', hapticsEnabled);
      }

      if (remaining <= 0) {
        lastTickedSec = -1;
        if (isInterval) {
          const totalRounds = timerCfg.rounds ?? 6;
          const restDuration = timerCfg.restSec ?? 30;

          if (phase === 'work') {
            if (round >= totalRounds) {
              setRunning(false);
              endTimestampRef.current = null;
              playTimerChime('done', soundEnabled);
              triggerHaptic('celebrate', hapticsEnabled);
              onNotify?.('Interval Complete!', `${exercise.name} finished — huge effort!`, 'celebrate', restAlertsEnabled);
            } else {
              setPhase('rest');
              setSecondsLeft(restDuration);
              endTimestampRef.current = Date.now() + restDuration * 1000;
              playTimerChime('rest', soundEnabled);
              triggerHaptic('pulse', hapticsEnabled);
              onNotify?.('Rest Phase!', `Catch your breath for ${restDuration}s.`, 'timer');
            }
          } else {
            setRound((r) => r + 1);
            setPhase('work');
            setSecondsLeft(timerCfg.durationSec);
            endTimestampRef.current = Date.now() + timerCfg.durationSec * 1000;
            playTimerChime('work', soundEnabled);
            triggerHaptic('pulse', hapticsEnabled);
            onNotify?.(`Round ${round + 1} GO!`, `Push hard for ${timerCfg.durationSec}s!`, 'boost');
          }
        } else {
          setRunning(false);
          endTimestampRef.current = null;
          playTimerChime('done', soundEnabled);
          triggerHaptic('celebrate', hapticsEnabled);
          onNotify?.(
            timerCfg.mode === 'rest' ? 'Rest Timer Finished!' : 'Timer Complete!',
            `${exercise.name} — ready to crush the next set!`,
            'timer',
            restAlertsEnabled
          );
          if (restAlertsEnabled) {
            sendLocalNotification(
              timerCfg.mode === 'rest' ? 'Rest Timer Finished' : 'Timer Complete',
              `${exercise.name} — ready for next set.`
            );
          }
        }
      }
    };

    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [
    running,
    phase,
    round,
    isInterval,
    timerCfg.durationSec,
    timerCfg.restSec,
    timerCfg.rounds,
    soundEnabled,
    hapticsEnabled,
    restAlertsEnabled,
    exercise.name,
    onNotify,
    timerCfg.mode,
    secondsLeft,
  ]);

  const startTimerWithSeconds = (sec: number) => {
    setSecondsLeft(sec);
    endTimestampRef.current = Date.now() + sec * 1000;
    setRunning(true);
    onNotify?.('Timer rolling!', `${sec}s on the clock for ${exercise.name}.`, 'timer');
  };

  const resetTimer = () => {
    setRunning(false);
    setPhase('work');
    setRound(1);
    setSecondsLeft(timerCfg.durationSec);
    endTimestampRef.current = null;
  };

  const sets: SetLog[] = useMemo(() => {
    return Array.from({ length: exercise.sets }, (_, i) => log?.sets?.[i] ?? { completed: false, weight: '' });
  }, [exercise.sets, log]);

  const formatMMSS = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5 px-4 pb-28 pt-4">
      <div className="flex items-center justify-between">
        <GlassIconButton
          icon={<ArrowLeft className="h-4.5 w-4.5" />}
          variant="primary"
          onClick={onBack}
          ariaLabel="Back"
        />
        <div className="flex items-center gap-2">
          <TypeChip type={exercise.type} />
          <PriorityChip priority={exercise.priority} />
        </div>
      </div>

      {/* Title & Muscles */}
      <div>
        <h1
          className={`text-[28px] font-extrabold tracking-[-0.03em] leading-tight lowercase ${
            darkSurface ? 'text-white' : 'text-[#111318]'
          }`}
        >
          {exercise.name}
        </h1>
        <p className={`mt-1 text-xs font-medium ${darkSurface ? 'text-white/60' : 'text-[#5b6170]'}`}>
          {exercise.sets} × {exercise.reps} · {exercise.muscles}
        </p>
      </div>

      {/* Live Liquid Glass Timer Arch Stage */}
      <LiquidGlass
        trainingType={exercise.type}
        priority={exercise.priority}
        shape="arch"
        active={running}
        className="p-5"
      >
        <div className="flex items-center justify-between text-xs text-white/75">
          <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
            <Timer className="h-3.5 w-3.5" />
            {timerCfg.mode === 'interval'
              ? `Interval · Round ${round}/${timerCfg.rounds ?? 6} · ${phase.toUpperCase()}`
              : timerCfg.mode === 'countdown'
                ? 'Exercise Countdown'
                : 'Rest Timer Between Sets'}
          </span>
          <span className="font-mono text-[11px] text-white/60">BG-SYNC</span>
        </div>

        <div className="my-4 text-center font-mono text-[52px] font-bold leading-none tracking-tight text-white tabular-nums">
          {formatMMSS(secondsLeft)}
        </div>

        <div className="flex items-center justify-center gap-3">
          <GlassButton
            label={running ? 'Pause' : 'Start Timer'}
            variant={running ? 'secondary' : 'cyan'}
            haptic={running ? 'toggleOff' : 'pulse'}
            size="sm"
            rightSlot={running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            onClick={() => {
              if (running) {
                setRunning(false);
              } else {
                startTimerWithSeconds(secondsLeft > 0 ? secondsLeft : timerCfg.durationSec);
              }
            }}
          />
          <GlassIconButton
            icon={<RotateCcw className="h-4 w-4" />}
            variant="primary"
            shape="circle"
            haptic="light"
            onClick={resetTimer}
            ariaLabel="Reset timer"
          />
        </div>

        {/* Square Liquid Glass rest presets for set-based exercises */}
        {timerCfg.mode === 'rest' && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[30, 60, 90, 120].map((sec) => (
              <LiquidGlass
                key={sec}
                as="button"
                type="button"
                shape="square"
                variant="primary"
                haptic="selection"
                onClick={() => startTimerWithSeconds(sec)}
                className="p-1.5"
              >
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="text-xs font-extrabold text-white tabular-nums">{sec}s</span>
                  <span className="text-[9px] uppercase text-white/55">rest</span>
                </div>
              </LiquidGlass>
            ))}
          </div>
        )}
      </LiquidGlass>

      {/* Set-by-Set Tracker (Kinetic Bevel Rows) */}
      <div className="space-y-2.5">
        <h2
          className={`text-sm font-bold uppercase tracking-wider ${
            darkSurface ? 'text-white/70' : 'text-[#4e5462]'
          }`}
        >
          set tracker ({units})
        </h2>
        {sets.map((setItem, idx) => (
          <LiquidGlass
            key={idx}
            variant={setItem.completed ? 'goldGreen' : 'primary'}
            shape="bevel"
            active={setItem.completed}
            className="px-4 py-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="w-14 text-sm font-bold text-white tabular-nums">
                Set {idx + 1}
              </span>
              <span className="text-xs text-white/65 tabular-nums">{exercise.reps}</span>
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5">
                <input
                  type="number"
                  inputMode="decimal"
                  value={setItem.weight}
                  onChange={(e) => onUpdateSet(idx, { weight: e.target.value })}
                  placeholder="0"
                  aria-label={`Set ${idx + 1} weight`}
                  className="w-14 bg-transparent text-right text-sm font-semibold text-white placeholder:text-white/40 focus:outline-none tabular-nums"
                />
                <span className="text-[11px] font-medium text-white/60">{units}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextDone = !setItem.completed;
                  triggerHaptic(nextDone ? 'celebrate' : 'toggleOff', hapticsEnabled);
                  onUpdateSet(idx, { completed: nextDone });
                  if (nextDone && timerCfg.mode === 'rest') {
                    startTimerWithSeconds(timerCfg.durationSec);
                  }
                }}
                aria-label={`Complete set ${idx + 1}`}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border transition active:scale-90 ${
                  setItem.completed
                    ? 'border-white/70 bg-white/25 text-white shadow-[0_0_12px_rgba(16,232,138,0.45)]'
                    : 'border-white/30 bg-black/35 text-white/40 hover:bg-white/10'
                }`}
              >
                <Check className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </LiquidGlass>
        ))}
      </div>

      {onNextExercise && (
        <GlassButton
          label="Next exercise"
          variant="primary"
          fullWidth
          rightSlot={<ChevronRight className="h-4 w-4" />}
          onClick={onNextExercise}
        />
      )}
    </div>
  );
};
