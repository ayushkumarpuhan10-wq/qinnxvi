import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Pause, Play, SkipForward } from 'lucide-react';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassIconButton } from '../components/glass/GlassIconButton';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { TypeChip } from '../components/glass/GlassBadges';
import { TrainingType } from '../theme/tokens';
import { SequenceStep } from '../types/workout';
import { playTimerChime, triggerHaptic } from '../utils/feedback';

interface SequenceScreenProps {
  title: string;
  subtitle: string;
  trainingType: TrainingType;
  steps: SequenceStep[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  darkSurface: boolean;
  onBack: () => void;
  onCompleteSequence: () => void;
}

export const SequenceScreen: React.FC<SequenceScreenProps> = ({
  title,
  subtitle,
  trainingType,
  steps,
  soundEnabled,
  hapticsEnabled,
  darkSurface,
  onBack,
  onCompleteSequence,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(steps[0]?.durationSec ?? 60);
  const [running, setRunning] = useState(false);
  const [completedAll, setCompletedAll] = useState(false);
  const endTsRef = useRef<number | null>(null);

  const currentStep = steps[stepIndex];

  useEffect(() => {
    setStepIndex(0);
    setSecondsLeft(steps[0]?.durationSec ?? 60);
    setRunning(false);
    setCompletedAll(false);
    endTsRef.current = null;
  }, [title, steps]);

  useEffect(() => {
    if (!running || completedAll) {
      endTsRef.current = null;
      return;
    }

    if (!endTsRef.current) {
      endTsRef.current = Date.now() + secondsLeft * 1000;
    }

    let lastTick = -1;
    const id = window.setInterval(() => {
      if (!endTsRef.current) return;
      const rem = Math.max(0, Math.ceil((endTsRef.current - Date.now()) / 1000));
      setSecondsLeft(rem);

      if (rem > 0 && rem <= 3 && rem !== lastTick) {
        lastTick = rem;
        triggerHaptic('tick', hapticsEnabled);
      }

      if (rem <= 0) {
        lastTick = -1;
        if (stepIndex + 1 < steps.length) {
          const nextIdx = stepIndex + 1;
          setStepIndex(nextIdx);
          const nextDur = steps[nextIdx].durationSec;
          setSecondsLeft(nextDur);
          endTsRef.current = Date.now() + nextDur * 1000;
          playTimerChime('work', soundEnabled);
          triggerHaptic('pulse', hapticsEnabled);
        } else {
          setRunning(false);
          setCompletedAll(true);
          endTsRef.current = null;
          playTimerChime('done', soundEnabled);
          triggerHaptic('celebrate', hapticsEnabled);
          onCompleteSequence();
        }
      }
    }, 250);

    return () => window.clearInterval(id);
  }, [running, completedAll, stepIndex, steps, soundEnabled, hapticsEnabled, onCompleteSequence]);

  const jumpToStep = (idx: number) => {
    setStepIndex(idx);
    const dur = steps[idx].durationSec;
    setSecondsLeft(dur);
    if (running) {
      endTsRef.current = Date.now() + dur * 1000;
    } else {
      endTsRef.current = null;
    }
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
        <TypeChip type={trainingType} />
      </div>

      <div>
        <h1
          className={`text-[30px] font-extrabold tracking-[-0.03em] leading-tight lowercase ${
            darkSurface ? 'text-white' : 'text-[#111318]'
          }`}
        >
          {title}
        </h1>
        <p className={`mt-1 text-xs font-medium ${darkSurface ? 'text-white/60' : 'text-[#5b6170]'}`}>
          {subtitle} · Auto-advances through {steps.length} moves
        </p>
      </div>

      {/* Active Move Glass Arch Timer */}
      <LiquidGlass trainingType={trainingType} shape="arch" active={running} className="p-5">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span className="font-semibold uppercase tracking-wider">
            Move {stepIndex + 1} / {steps.length}
          </span>
          {currentStep?.setsLabel && (
            <span className="font-mono text-white/85">{currentStep.setsLabel}</span>
          )}
        </div>

        <h2 className="mt-2 text-2xl font-bold text-white">{currentStep?.name}</h2>
        <p className="mt-1 text-xs text-white/75">{currentStep?.cue}</p>

        <div className="my-5 text-center font-mono text-[56px] font-bold leading-none text-white tabular-nums">
          {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
          {String(secondsLeft % 60).padStart(2, '0')}
        </div>

        <div className="flex items-center justify-center gap-3">
          <GlassButton
            label={completedAll ? 'Completed ✓' : running ? 'Pause' : 'Start Sequence'}
            variant={running ? 'secondary' : 'primary'}
            haptic={running ? 'toggleOff' : 'pulse'}
            size="sm"
            rightSlot={
              completedAll ? (
                <Check className="h-4 w-4" />
              ) : running ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-white" />
              )
            }
            onClick={() => {
              if (completedAll) {
                onBack();
              } else if (running) {
                setRunning(false);
              } else {
                endTsRef.current = Date.now() + secondsLeft * 1000;
                setRunning(true);
              }
            }}
          />
          {!completedAll && (
            <GlassIconButton
              icon={<SkipForward className="h-4 w-4" />}
              variant="cyan"
              shape="circle"
              haptic="double"
              ariaLabel="Next move"
              onClick={() => {
                if (stepIndex + 1 < steps.length) {
                  jumpToStep(stepIndex + 1);
                } else {
                  setRunning(false);
                  setCompletedAll(true);
                  triggerHaptic('celebrate', hapticsEnabled);
                  onCompleteSequence();
                }
              }}
            />
          )}
        </div>
      </LiquidGlass>

      {/* Full Sequence List (Bevel Rows) */}
      <div className="space-y-2">
        {steps.map((s, i) => {
          const isCurrent = i === stepIndex && !completedAll;
          const isPast = i < stepIndex || completedAll;
          return (
            <LiquidGlass
              key={s.id}
              as="button"
              onClick={() => jumpToStep(i)}
              trainingType={isCurrent ? trainingType : undefined}
              variant={isPast ? 'goldGreen' : 'primary'}
              shape="bevel"
              haptic="selection"
              active={isCurrent}
              className="w-full px-4 py-2.5 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {String(i + 1).padStart(2, '0')} · {s.name}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-white/75 tabular-nums">
                  {isPast ? '✓' : s.setsLabel ?? `${s.durationSec}s`}
                </span>
              </div>
            </LiquidGlass>
          );
        })}
      </div>

      <GlassButton
        label="Mark sequence complete"
        variant="secondary"
        fullWidth
        onClick={() => {
          setRunning(false);
          setCompletedAll(true);
          onCompleteSequence();
          onBack();
        }}
      />
    </div>
  );
};
