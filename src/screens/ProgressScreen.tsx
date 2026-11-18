import React, { useMemo, useState } from 'react';
import { Award, Footprints, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PriorityChip, TypeChip } from '../components/glass/GlassBadges';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { PRIORITY_THEMES, PriorityLevel, RANK_THEMES, TRAINING_TYPE_THEMES, TrainingType } from '../theme/tokens';
import { DailyProgress, DayKey, DayPlan, RankHistoryEntry } from '../types/workout';
import { triggerHaptic } from '../utils/feedback';

interface ProgressScreenProps {
  plan: Record<DayKey, DayPlan>;
  logs: Record<string, DailyProgress>;
  rankHistory: RankHistoryEntry[];
  streak: number;
  stepGoal: number;
  units: 'kg' | 'lbs';
  darkSurface: boolean;
}

interface ExerciseMeta {
  id: string;
  name: string;
  priority: PriorityLevel;
  type: TrainingType;
  day: DayKey;
}

const COMPOUND_PALETTE = [
  '#FF2A4D',
  '#38BDF8',
  '#A78BFA',
  '#FBBF24',
  '#10E88A',
  '#FB7185',
  '#22D3EE',
];

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  plan,
  logs,
  rankHistory,
  streak,
  stepGoal,
  units,
  darkSurface,
}) => {
  const [scope, setScope] = useState<'compound' | 'all'>('compound');
  const [selectedExId, setSelectedExId] = useState<string>('ALL_COMPOUND');
  const [pinnedBar, setPinnedBar] = useState<{ dateISO: string; weight: number } | null>(null);

  const exerciseMetaMap = useMemo(() => {
    const map = new Map<string, ExerciseMeta>();
    Object.values(plan).forEach((dp) => {
      dp.exercises.forEach((ex) => {
        if (!map.has(ex.id)) {
          map.set(ex.id, {
            id: ex.id,
            name: ex.name,
            priority: ex.priority,
            type: ex.type,
            day: dp.day,
          });
        }
      });
    });
    return map;
  }, [plan]);

  const primaryCompoundCatalog = useMemo(
    () => Array.from(exerciseMetaMap.values()).filter((m) => m.priority === 'R'),
    [exerciseMetaMap]
  );

  // Build per-exercise logged progression points from real daily logs
  const loggedExercises = useMemo(() => {
    const result: Record<
      string,
      { meta: ExerciseMeta; points: { dateISO: string; label: string; weight: number }[] }
    > = {};

    const sortedDates = Object.keys(logs).sort();
    sortedDates.forEach((dateISO) => {
      const entry = logs[dateISO];
      Object.entries(entry.exercises).forEach(([exId, exLog]) => {
        const weights = exLog.sets
          .map((s) => parseFloat(s.weight))
          .filter((n) => !Number.isNaN(n) && n > 0);
        if (weights.length > 0) {
          const maxW = Math.max(...weights);
          const meta = exerciseMetaMap.get(exId) ?? {
            id: exId,
            name: exId,
            priority: 'B' as PriorityLevel,
            type: 'Strength' as TrainingType,
            day: entry.dayKey,
          };
          if (!result[exId]) {
            result[exId] = { meta, points: [] };
          }
          result[exId].points.push({
            dateISO,
            label: dateISO.slice(5),
            weight: maxW,
          });
        }
      });
    });

    return result;
  }, [exerciseMetaMap, logs]);

  const filteredIds = useMemo(() => {
    const ids = Object.keys(loggedExercises);
    if (scope === 'compound') {
      return ids.filter((id) => loggedExercises[id].meta.priority === 'R');
    }
    return ids;
  }, [loggedExercises, scope]);

  // Determine active view mode: multi-line overlay of all compound lifts or single exercise area curve
  const isMultiCompound =
    scope === 'compound' && selectedExId === 'ALL_COMPOUND' && filteredIds.length > 1;

  const activeSingleId =
    selectedExId !== 'ALL_COMPOUND' && filteredIds.includes(selectedExId)
      ? selectedExId
      : filteredIds[0];

  // Multi-series dataset by date for Recharts LineChart
  const multiSeriesData = useMemo(() => {
    if (!isMultiCompound) return [];
    const byDate: Record<string, Record<string, string | number>> = {};
    filteredIds.forEach((id) => {
      loggedExercises[id].points.forEach((pt) => {
        if (!byDate[pt.dateISO]) {
          byDate[pt.dateISO] = { dateISO: pt.dateISO, label: pt.label };
        }
        byDate[pt.dateISO][id] = pt.weight;
      });
    });
    return Object.values(byDate).sort((a, b) =>
      String(a.dateISO).localeCompare(String(b.dateISO))
    );
  }, [filteredIds, isMultiCompound, loggedExercises]);

  const singleSeriesData = useMemo(() => {
    if (!activeSingleId || isMultiCompound) return [];
    return loggedExercises[activeSingleId]?.points ?? [];
  }, [activeSingleId, isMultiCompound, loggedExercises]);

  const singleStats = useMemo(() => {
    if (singleSeriesData.length === 0) return null;
    const weights = singleSeriesData.map((p) => p.weight);
    const peak = Math.max(...weights);
    const latest = weights[weights.length - 1];
    const first = weights[0];
    const delta = Number((latest - first).toFixed(1));
    return { peak, latest, delta, sessions: weights.length };
  }, [singleSeriesData]);

  const recentSteps = useMemo(() => {
    return Object.values(logs)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
      .slice(-7)
      .map((d) => ({
        date: d.dayKey,
        steps: d.steps,
        achieved: d.steps >= stepGoal,
      }));
  }, [logs, stepGoal]);

  const activeMeta = activeSingleId ? loggedExercises[activeSingleId]?.meta : undefined;
  const activeStrokeColor = activeMeta
    ? activeMeta.priority === 'R'
      ? PRIORITY_THEMES.R.outlineColor
      : TRAINING_TYPE_THEMES[activeMeta.type].accentHex
    : '#FF2A4D';

  return (
    <div className="space-y-5 px-4 pb-28 pt-4">
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-xs font-semibold ${darkSurface ? 'text-white/55' : 'text-[#5b6170]'}`}>
            Offline analytics · {rankHistory.length} logged days
          </p>
          <h1
            className={`text-[34px] font-extrabold tracking-[-0.04em] leading-tight lowercase ${
              darkSurface ? 'text-white' : 'text-[#111318]'
            }`}
          >
            progress
          </h1>
        </div>
        <LiquidGlass variant="secondary" shape="diamond" className="h-14 w-14">
          <div className="flex flex-col items-center justify-center text-center leading-none">
            <span className="text-xs font-extrabold text-white tabular-nums">{streak}d</span>
            <span className="text-[8px] uppercase text-white/70">streak</span>
          </div>
        </LiquidGlass>
      </div>

      {/* Geometric KPI Trio: Square, Squircle, Circle */}
      <div className="grid grid-cols-3 gap-2.5">
        <LiquidGlass variant="cyan" shape="square" className="p-3">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-white tabular-nums">
              {rankHistory.length}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-200/75">
              Logged
            </span>
          </div>
        </LiquidGlass>

        <LiquidGlass variant="primary" priority="R" shape="squircle" className="p-3">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-white tabular-nums">
              {primaryCompoundCatalog.length}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-200/80">
              [R] Lifts
            </span>
          </div>
        </LiquidGlass>

        <LiquidGlass variant="goldGreen" shape="circle" className="p-3">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-white tabular-nums">
              {recentSteps.filter((d) => d.achieved).length}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200/80">
              10k Days
            </span>
          </div>
        </LiquidGlass>
      </div>

      {/* Primary Compound Lifts Progression Chart (Recharts in Squircle) */}
      <LiquidGlass
        variant="primary"
        priority={scope === 'compound' ? 'R' : undefined}
        shape="squircle"
        className="p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            <TrendingUp className="h-4 w-4 text-[#FF2A4D]" />
            <span>Compound Lift Progression ({units})</span>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/40 p-0.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setScope('compound');
                setSelectedExId('ALL_COMPOUND');
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                scope === 'compound' ? 'bg-[#FF2A4D] text-white' : 'text-white/65 hover:text-white'
              }`}
            >
              Primary [R]
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setScope('all');
                setSelectedExId('');
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                scope === 'all' ? 'bg-white text-[#111318]' : 'text-white/65 hover:text-white'
              }`}
            >
              All Lifts
            </button>
          </div>
        </div>

        {/* Lift Selector */}
        {filteredIds.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <select
              value={isMultiCompound ? 'ALL_COMPOUND' : activeSingleId ?? ''}
              onChange={(e) => setSelectedExId(e.target.value)}
              aria-label="Select exercise progression chart"
              className="w-full rounded-full border border-white/20 bg-black/45 px-3.5 py-1.5 text-xs font-semibold text-white focus:outline-none"
            >
              {scope === 'compound' && filteredIds.length > 1 && (
                <option value="ALL_COMPOUND" className="bg-[#181a22] text-white">
                  All Logged Compound Lifts ({filteredIds.length})
                </option>
              )}
              {filteredIds.map((id) => (
                <option key={id} value={id} className="bg-[#181a22] text-white">
                  [{loggedExercises[id].meta.priority}] {loggedExercises[id].meta.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Single Lift Metrics Summary */}
        {!isMultiCompound && activeMeta && singleStats && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <TypeChip type={activeMeta.type} />
              <PriorityChip priority={activeMeta.priority} />
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/80 tabular-nums">
              <span>
                Peak <strong className="text-white">{singleStats.peak}{units}</strong>
              </span>
              <span
                className={
                  singleStats.delta >= 0 ? 'font-bold text-emerald-300' : 'font-bold text-rose-300'
                }
              >
                {singleStats.delta >= 0 ? `+${singleStats.delta}` : singleStats.delta}
                {units}
              </span>
            </div>
          </div>
        )}

        {/* Recharts BarChart with Hover & Tap Tooltips (Specific Date + Weight Lifted) */}
        {filteredIds.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
            <p className="text-xs font-semibold text-white/85">
              No {scope === 'compound' ? 'primary compound [R]' : ''} lift weights logged yet.
            </p>
            <p className="mt-1 text-[11px] text-white/55">
              Open a workout day, tap any <span className="text-[#ff7890] font-semibold">[R]</span> lift, and log set weights to plot progression here.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {primaryCompoundCatalog.slice(0, 5).map((item) => (
                <span
                  key={item.id}
                  className="rounded-full border border-[#FF2A4D]/40 bg-[#FF2A4D]/15 px-2.5 py-0.5 text-[10px] font-medium text-[#FFD6DD]"
                >
                  {item.day} · {item.name}
                </span>
              ))}
            </div>
          </div>
        ) : isMultiCompound ? (
          <div className="mt-4 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiSeriesData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.45)"
                  tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.45)"
                  tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  trigger="hover"
                  cursor={{ fill: 'rgba(255,255,255,0.08)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const row = payload[0]?.payload as { dateISO?: string; label?: string } | undefined;
                    return (
                      <div className="rounded-2xl border border-white/25 bg-[#11131a]/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-md">
                        <p className="font-bold text-white/90 tabular-nums">
                          Date: {row?.dateISO ?? row?.label}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          {payload.map((entry) => (
                            <p key={String(entry.dataKey)} className="flex items-center justify-between gap-3 tabular-nums">
                              <span style={{ color: entry.color }}>
                                {loggedExercises[String(entry.dataKey)]?.meta.name ?? String(entry.dataKey)}
                              </span>
                              <span className="font-extrabold text-white">
                                {entry.value} {units}
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                {filteredIds.map((id, i) => (
                  <Bar
                    key={id}
                    dataKey={id}
                    name={id}
                    fill={COMPOUND_PALETTE[i % COMPOUND_PALETTE.length]}
                    radius={[6, 6, 2, 2]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={singleSeriesData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="compoundBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={activeStrokeColor} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={activeStrokeColor} stopOpacity={0.38} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.45)"
                    tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.45)"
                    tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    trigger="hover"
                    cursor={{ fill: 'rgba(255,255,255,0.08)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const pt = payload[0].payload as { dateISO: string; weight: number };
                      return (
                        <div className="rounded-2xl border border-white/25 bg-[#11131a]/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-md">
                          <p className="text-[11px] font-semibold text-white/70">{activeMeta?.name}</p>
                          <p className="mt-0.5 font-bold text-white tabular-nums">
                            {pt.dateISO} · {pt.weight} {units}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="weight"
                    fill="url(#compoundBarGrad)"
                    radius={[8, 8, 2, 2]}
                    onClick={(barData) => {
                      const pt = barData?.payload as { dateISO: string; weight: number } | undefined;
                      if (pt) {
                        triggerHaptic('selection');
                        setPinnedBar(pt);
                      }
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {pinnedBar && (
              <div className="mt-2 flex items-center justify-between rounded-full border border-white/15 bg-black/35 px-3.5 py-1.5 text-[11px] text-white tabular-nums">
                <span>
                  Selected: <strong>{pinnedBar.dateISO}</strong>
                </span>
                <span className="font-extrabold text-[#ff8fa3]">
                  {pinnedBar.weight} {units} lifted
                </span>
              </div>
            )}
          </div>
        )}
      </LiquidGlass>

      {/* Weekly Rank History (Kinetic Bevel Card) */}
      <LiquidGlass variant="primary" shape="bevel" className="p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
          <Award className="h-4 w-4 text-amber-300" />
          <span>Weekly Rank History</span>
        </div>

        {rankHistory.length === 0 ? (
          <p className="py-4 text-center text-xs text-white/60">
            Complete today&apos;s checklist or reveal your rank to record history.
          </p>
        ) : (
          <div className="space-y-2">
            {rankHistory.slice(-7).reverse().map((item) => {
              const rt = RANK_THEMES[item.rank];
              return (
                <div
                  key={item.dateISO}
                  className="flex items-center justify-between rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-white/10 bg-white/5 px-3.5 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.dayKey} · {item.dateISO}
                    </p>
                    <p className="text-[11px] text-white/65 tabular-nums">
                      {item.completionPct}% complete · {item.missedCount} missed
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-extrabold tracking-wide text-white"
                    style={{ background: rt.gradient, border: `1px solid ${rt.accent}` }}
                  >
                    {item.rank}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </LiquidGlass>

      {/* Step History (Recharts BarChart in Arch) */}
      <LiquidGlass variant="goldGreen" shape="arch" className="p-4">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/70">
          <div className="flex items-center gap-2">
            <Footprints className="h-4 w-4 text-emerald-300" />
            <span>Step History</span>
          </div>
          <span className="tabular-nums">Goal: {stepGoal.toLocaleString()}</span>
        </div>

        {recentSteps.length === 0 ? (
          <p className="py-4 text-center text-xs text-white/60">
            Log steps on Today to track daily walking streaks.
          </p>
        ) : (
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentSteps} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.45)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.45)"
                  tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 19, 26, 0.94)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${Number(val).toLocaleString()} steps`, 'Steps']}
                />
                <ReferenceLine y={stepGoal} stroke="#FBBF24" strokeDasharray="4 4" />
                <Bar dataKey="steps" radius={[8, 8, 2, 2]}>
                  {recentSteps.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.achieved ? '#10E88A' : 'rgba(255,255,255,0.35)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </LiquidGlass>
    </div>
  );
};
