import React, { useState } from 'react';
import { ArrowLeft, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { DAY_ORDER } from '../data/program';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassIconButton } from '../components/glass/GlassIconButton';
import { PriorityChip, TypeChip } from '../components/glass/GlassBadges';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { PriorityLevel, TRAINING_TYPE_THEMES, TrainingType } from '../theme/tokens';
import { DayKey, DayPlan, ExerciseItem, TimerMode } from '../types/workout';

interface PlanEditorScreenProps {
  plan: Record<DayKey, DayPlan>;
  initialDay: DayKey;
  darkSurface: boolean;
  onBack: () => void;
  onUpsertExercise: (dayKey: DayKey, exercise: ExerciseItem) => void;
  onDeleteExercise: (dayKey: DayKey, exerciseId: string) => void;
  onResetPlan: () => void;
}

export const PlanEditorScreen: React.FC<PlanEditorScreenProps> = ({
  plan,
  initialDay,
  darkSurface,
  onBack,
  onUpsertExercise,
  onDeleteExercise,
  onResetPlan,
}) => {
  const [dayKey, setDayKey] = useState<DayKey>(initialDay);
  const [editing, setEditing] = useState<ExerciseItem | null>(null);

  const openNew = () => {
    setEditing({
      id: `${dayKey.toLowerCase()}-${Date.now()}`,
      name: '',
      sets: 3,
      reps: '10',
      type: plan[dayKey].primaryType,
      priority: 'B',
      muscles: '',
      timer: { mode: 'rest', durationSec: 60 },
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.name.trim()) return;
    onUpsertExercise(dayKey, {
      ...editing,
      name: editing.name.trim(),
      muscles: editing.muscles.trim() || 'full body',
    });
    setEditing(null);
  };

  return (
    <div className="space-y-4 px-4 pb-28 pt-4">
      <div className="flex items-center justify-between">
        <GlassIconButton
          icon={<ArrowLeft className="h-4.5 w-4.5" />}
          variant="primary"
          onClick={onBack}
          ariaLabel="Back"
        />
        <h1
          className={`text-xl font-extrabold tracking-tight lowercase ${
            darkSurface ? 'text-white' : 'text-[#111318]'
          }`}
        >
          plan editor
        </h1>
        <GlassIconButton
          icon={<RotateCcw className="h-4 w-4" />}
          variant="cyan"
          onClick={onResetPlan}
          ariaLabel="Reset default plan"
        />
      </div>

      {/* Day Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DAY_ORDER.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              setDayKey(d);
              setEditing(null);
            }}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${
              dayKey === d
                ? darkSurface
                  ? 'bg-white text-[#111318] shadow-md'
                  : 'bg-[#111318] text-white shadow-md'
                : darkSurface
                  ? 'bg-white/10 text-white/70'
                  : 'bg-black/8 text-[#323643]'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {editing ? (
        <LiquidGlass variant="primary" shape="card" className="p-4">
          <form onSubmit={handleSave} className="space-y-3">
            <h2 className="text-sm font-bold text-white">
              {plan[dayKey].exercises.some((e) => e.id === editing.id) ? 'Edit Exercise' : 'New Exercise'}
            </h2>

            <input
              type="text"
              required
              placeholder="Exercise name"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/45 focus:outline-none"
            />

            <input
              type="text"
              placeholder="Target muscles (e.g. lats, biceps)"
              value={editing.muscles}
              onChange={(e) => setEditing({ ...editing, muscles: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/45 focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] text-white/65">Sets</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={editing.sets}
                  onChange={(e) => setEditing({ ...editing, sets: Number(e.target.value) || 1 })}
                  className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-white/65">Reps / Target</label>
                <input
                  type="text"
                  value={editing.reps}
                  onChange={(e) => setEditing({ ...editing, reps: e.target.value })}
                  className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] text-white/65">Training Type</label>
                <select
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value as TrainingType })}
                  className="w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  {(Object.keys(TRAINING_TYPE_THEMES) as TrainingType[]).map((t) => (
                    <option key={t} value={t} className="bg-[#111318]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-white/65">Priority</label>
                <select
                  value={editing.priority}
                  onChange={(e) => setEditing({ ...editing, priority: e.target.value as PriorityLevel })}
                  className="w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="R" className="bg-[#111318]">R — Red (Compound)</option>
                  <option value="B" className="bg-[#111318]">B — Blue (Secondary)</option>
                  <option value="G" className="bg-[#111318]">G — Green (Accessory)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] text-white/65">Timer Mode</label>
                <select
                  value={editing.timer.mode}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      timer: { ...editing.timer, mode: e.target.value as TimerMode },
                    })
                  }
                  className="w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="rest" className="bg-[#111318]">Rest between sets</option>
                  <option value="countdown" className="bg-[#111318]">Countdown</option>
                  <option value="interval" className="bg-[#111318]">Interval</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-white/65">Timer Secs</label>
                <input
                  type="number"
                  min={5}
                  value={editing.timer.durationSec}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      timer: { ...editing.timer, durationSec: Number(e.target.value) || 30 },
                    })
                  }
                  className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <GlassButton label="Save" type="submit" variant="secondary" fullWidth size="sm" />
              <GlassButton
                label="Cancel"
                variant="primary"
                size="sm"
                onClick={() => setEditing(null)}
              />
            </div>
          </form>
        </LiquidGlass>
      ) : (
        <GlassButton
          label={`Add exercise to ${dayKey}`}
          variant="secondary"
          fullWidth
          rightSlot={<Plus className="h-4 w-4" />}
          onClick={openNew}
        />
      )}

      {/* Existing Exercises */}
      <div className="space-y-2.5">
        {plan[dayKey].exercises.map((ex) => (
          <LiquidGlass
            key={ex.id}
            trainingType={ex.type}
            priority={ex.priority}
            shape="card"
            className="p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setEditing(ex)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-center gap-1.5">
                  <TypeChip type={ex.type} />
                  <PriorityChip priority={ex.priority} />
                </div>
                <p className="mt-1.5 truncate text-sm font-bold text-white">{ex.name}</p>
                <p className="text-xs text-white/70 tabular-nums">
                  {ex.sets}×{ex.reps} · {ex.timer.mode} {ex.timer.durationSec}s
                </p>
              </button>
              <button
                type="button"
                onClick={() => onDeleteExercise(dayKey, ex.id)}
                aria-label={`Delete ${ex.name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/35 text-rose-300 hover:bg-rose-500/25"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </LiquidGlass>
        ))}
      </div>
    </div>
  );
};
