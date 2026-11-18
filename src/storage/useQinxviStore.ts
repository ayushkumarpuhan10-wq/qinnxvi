import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DAY_ORDER,
  INITIAL_WEEK_PLAN,
  getTodayDayKey,
  getTodayISO,
} from '../data/program';
import { PriorityLevel, RankTier } from '../theme/tokens';
import {
  AppSettings,
  BubblyNotificationItem,
  DailyProgress,
  DayKey,
  DayPlan,
  ExerciseItem,
  ExerciseLog,
  RankHistoryEntry,
  SetLog,
} from '../types/workout';
import {
  playTimerChime,
  sendLocalNotification,
  setFeedbackPreferences,
  triggerHaptic,
} from '../utils/feedback';

const STORAGE_KEYS = {
  PLAN: 'qinxvi_week_plan_v1',
  LOGS: 'qinxvi_daily_logs_v1',
  SETTINGS: 'qinxvi_settings_v3',
  NOTIFICATIONS: 'qinxvi_notifications_v1',
  SESSION_UNLOCKED: 'qinxvi_session_unlocked',
};

const DEFAULT_SETTINGS: AppSettings = {
  requireCodeEveryLaunch: false,
  stepGoal: 10000,
  units: 'kg',
  darkSurface: true,
  hapticsEnabled: true,
  soundEnabled: true,
  notifications: {
    dailyWorkout: true,
    dailyWorkoutTime: '07:00',
    warmupReminder: true,
    restTimerAlert: true,
    missedWorkoutEvening: true,
    eveningPosture: true,
    sleepReminder: true,
    stepGoalReminders: true,
    nightRankResult: true,
    bubblyPopups: true,
    hydrationNudge: true,
    prCelebration: true,
    stretchCheckIn: true,
    sessionBoost: true,
    twoHourSessionReminder: true,
    twoHourSessionIntervalMin: 120,
    oneHourSessionReminder: true,
    oneHourSessionIntervalMin: 60,
  },
};

function safeReadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function createEmptyDailyProgress(dateISO: string, dayKey: DayKey): DailyProgress {
  return {
    dateISO,
    dayKey,
    exercises: {},
    warmupDone: false,
    mainSessionDone: false,
    extraHourDone: false,
    postureDone: false,
    staminaFinisherDone: false,
    steps: 0,
  };
}

export function computeChecklistSummary(
  dayPlan: DayPlan,
  progress: DailyProgress,
  stepGoal: number
) {
  const totalExercises = dayPlan.exercises.length;
  const completedExercises = dayPlan.exercises.filter(
    (ex) => progress.exercises[ex.id]?.completed
  ).length;
  const stepsDone = progress.steps >= stepGoal;

  const totalItems = totalExercises + 3; // exercises + warm-up + steps + 1hr extra session
  const completedItems =
    completedExercises +
    (progress.warmupDone ? 1 : 0) +
    (stepsDone ? 1 : 0) +
    (progress.extraHourDone ? 1 : 0);

  const missedCount = Math.max(0, totalItems - completedItems);
  const completionPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;

  let rank: RankTier = 'LOSER';
  if (missedCount === 0) rank = 'DEMON';
  else if (missedCount <= 2) rank = 'BEAST';

  return {
    totalItems,
    completedItems,
    missedCount,
    completionPct,
    rank,
    stepsDone,
    completedExercises,
    totalExercises,
  };
}

export function useQinxviStore() {
  const [plan, setPlan] = useState<Record<DayKey, DayPlan>>(() =>
    safeReadJSON(STORAGE_KEYS.PLAN, INITIAL_WEEK_PLAN)
  );
  const [logs, setLogs] = useState<Record<string, DailyProgress>>(() =>
    safeReadJSON(STORAGE_KEYS.LOGS, {})
  );
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = safeReadJSON<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, {});
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(saved.notifications ?? {}),
      },
    };
  });
  const [notificationHistory, setNotificationHistory] = useState<BubblyNotificationItem[]>(() =>
    safeReadJSON(STORAGE_KEYS.NOTIFICATIONS, [])
  );
  const [activeToasts, setActiveToasts] = useState<BubblyNotificationItem[]>([]);

  const [unlocked, setUnlocked] = useState<boolean>(() => {
    const savedSettings = safeReadJSON<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, {});
    if (savedSettings.requireCodeEveryLaunch) return false;
    return sessionStorage.getItem(STORAGE_KEYS.SESSION_UNLOCKED) === 'true';
  });

  const todayISO = getTodayISO();
  const todayDayKey = getTodayDayKey();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
    } catch {
      // Ignore storage quota errors
    }
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch {
      // Ignore storage quota errors
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationHistory));
    } catch {
      // Ignore storage quota errors
    }
  }, [notificationHistory]);

  useEffect(() => {
    setFeedbackPreferences({
      hapticsEnabled: settings.hapticsEnabled,
      soundEnabled: settings.soundEnabled,
    });
  }, [settings.hapticsEnabled, settings.soundEnabled]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-surface', settings.darkSurface);
    }
  }, [settings.darkSurface]);

  const dismissToast = useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (
      title: string,
      message: string,
      tone: BubblyNotificationItem['tone'] = 'boost',
      alsoBrowser = false
    ) => {
      const item: BubblyNotificationItem = {
        id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        message,
        tone,
        createdAt: new Date().toISOString(),
      };

      setNotificationHistory((prev) => [item, ...prev].slice(0, 40));

      if (settings.notifications.bubblyPopups) {
        playTimerChime('bubble', settings.soundEnabled);
        setActiveToasts((prev) => [item, ...prev].slice(0, 3));
        window.setTimeout(() => {
          setActiveToasts((prev) => prev.filter((t) => t.id !== item.id));
        }, 3600);
      }

      if (alsoBrowser) {
        sendLocalNotification(title, message);
      }
    },
    [settings.notifications.bubblyPopups, settings.soundEnabled]
  );

  const unlockWithCode = useCallback(
    (code: string): boolean => {
      if (code.trim().toUpperCase() === 'QINXVI') {
        setUnlocked(true);
        sessionStorage.setItem(STORAGE_KEYS.SESSION_UNLOCKED, 'true');
        triggerHaptic('success', settings.hapticsEnabled);
        notify('Welcome back, Beast!', 'QINXVI unlocked — your 2hr + 1hr sessions await!', 'celebrate');
        return true;
      }
      triggerHaptic('error', settings.hapticsEnabled);
      notify('Oops! Wrong code', 'Enter QINXVI to pop the lock open.', 'info');
      return false;
    },
    [notify, settings.hapticsEnabled]
  );

  const lockApp = useCallback(() => {
    setUnlocked(false);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_UNLOCKED);
    notify('Session locked', 'Progress safely stored offline.', 'info');
  }, [notify]);

  const getLogForDate = useCallback(
    (dateISO: string, dayKey: DayKey): DailyProgress => {
      return logs[dateISO] ?? createEmptyDailyProgress(dateISO, dayKey);
    },
    [logs]
  );

  const todayProgress = useMemo(
    () => getLogForDate(todayISO, todayDayKey),
    [getLogForDate, todayISO, todayDayKey]
  );

  const updateDayLog = useCallback(
    (dateISO: string, dayKey: DayKey, updater: (prev: DailyProgress) => DailyProgress) => {
      setLogs((prev) => {
        const current = prev[dateISO] ?? createEmptyDailyProgress(dateISO, dayKey);
        return {
          ...prev,
          [dateISO]: updater(current),
        };
      });
    },
    []
  );

  const toggleExerciseDone = useCallback(
    (dayKey: DayKey, exercise: ExerciseItem, dateISO = todayISO) => {
      triggerHaptic('light', settings.hapticsEnabled);
      const wasDone = logs[dateISO]?.exercises[exercise.id]?.completed ?? false;
      updateDayLog(dateISO, dayKey, (prev) => {
        const existing = prev.exercises[exercise.id];
        const nextCompleted = !(existing?.completed ?? false);
        const sets: SetLog[] =
          existing?.sets?.length === exercise.sets
            ? existing.sets.map((s) => ({ ...s, completed: nextCompleted }))
            : Array.from({ length: exercise.sets }, (_, i) => ({
                completed: nextCompleted,
                weight: existing?.sets?.[i]?.weight ?? '',
              }));
        return {
          ...prev,
          exercises: {
            ...prev.exercises,
            [exercise.id]: { completed: nextCompleted, sets },
          },
        };
      });

      if (!wasDone) {
        notify(
          `${exercise.name} crushed!`,
          exercise.priority === 'R'
            ? 'Primary compound lift locked in! Sip water & keep rolling!'
            : 'Checked off & saved! Momentum is building!',
          'celebrate'
        );
      } else {
        notify('Checklist updated', `${exercise.name} marked active again.`, 'info');
      }
    },
    [logs, notify, settings.hapticsEnabled, todayISO, updateDayLog]
  );

  const updateSetLog = useCallback(
    (
      dayKey: DayKey,
      exercise: ExerciseItem,
      setIndex: number,
      patch: Partial<SetLog>,
      dateISO = todayISO
    ) => {
      if (patch.completed !== undefined) {
        triggerHaptic(patch.completed ? 'success' : 'light', settings.hapticsEnabled);
      }
      updateDayLog(dateISO, dayKey, (prev) => {
        const existing: ExerciseLog = prev.exercises[exercise.id] ?? {
          completed: false,
          sets: Array.from({ length: exercise.sets }, () => ({ completed: false, weight: '' })),
        };
        const sets = Array.from({ length: exercise.sets }, (_, i) => {
          const cur = existing.sets[i] ?? { completed: false, weight: '' };
          return i === setIndex ? { ...cur, ...patch } : cur;
        });
        const allDone = sets.every((s) => s.completed);
        return {
          ...prev,
          exercises: {
            ...prev.exercises,
            [exercise.id]: {
              completed: allDone,
              sets,
            },
          },
        };
      });

      if (patch.completed === true) {
        const msgs = [
          'Boom! Set locked in — hydrate & breathe!',
          'Clean reps! Rest up and hit the next one!',
          'Pure power! Every set stacks toward DEMON!',
        ];
        notify(
          `Set ${setIndex + 1} complete!`,
          msgs[setIndex % msgs.length],
          settings.notifications.hydrationNudge && setIndex % 2 === 1 ? 'hydration' : 'boost'
        );
      }
    },
    [notify, settings.hapticsEnabled, settings.notifications.hydrationNudge, todayISO, updateDayLog]
  );

  const addSteps = useCallback(
    (delta: number, dateISO = todayISO, dayKey = todayDayKey, silent = false) => {
      if (!silent) triggerHaptic('light', settings.hapticsEnabled);
      const prevSteps = logs[dateISO]?.steps ?? 0;
      const nextSteps = Math.max(0, prevSteps + delta);
      updateDayLog(dateISO, dayKey, (prev) => ({
        ...prev,
        steps: Math.max(0, prev.steps + delta),
      }));

      if (!silent && delta >= 100) {
        if (prevSteps < settings.stepGoal && nextSteps >= settings.stepGoal) {
          notify(
            '10,000 Steps Smashed!',
            'Gold/Green step ring unlocked! Pure cardio discipline!',
            'celebrate',
            true
          );
        } else {
          notify(
            `+${delta.toLocaleString()} steps added!`,
            `Total today: ${nextSteps.toLocaleString()} / ${settings.stepGoal.toLocaleString()}`,
            'hydration'
          );
        }
      }
    },
    [logs, notify, settings.hapticsEnabled, settings.stepGoal, todayDayKey, todayISO, updateDayLog]
  );

  const setStepsExact = useCallback(
    (steps: number, dateISO = todayISO, dayKey = todayDayKey) => {
      updateDayLog(dateISO, dayKey, (prev) => ({
        ...prev,
        steps: Math.max(0, steps),
      }));
      notify('Steps saved!', `Daily steps updated to ${steps.toLocaleString()}.`, 'hydration');
    },
    [notify, todayDayKey, todayISO, updateDayLog]
  );

  const toggleChecklistFlag = useCallback(
    (
      field: 'warmupDone' | 'mainSessionDone' | 'extraHourDone' | 'postureDone' | 'staminaFinisherDone',
      value?: boolean,
      dateISO = todayISO,
      dayKey = todayDayKey
    ) => {
      triggerHaptic('success', settings.hapticsEnabled);
      const currentVal = Boolean(logs[dateISO]?.[field]);
      const nextVal = value !== undefined ? value : !currentVal;
      updateDayLog(dateISO, dayKey, (prev) => ({
        ...prev,
        [field]: nextVal,
      }));

      const labels: Record<typeof field, [string, string]> = {
        warmupDone: ['Warm-up complete!', 'Joints primed & CNS buzzing for heavy work!'],
        mainSessionDone: ['2-Hour Main Session done!', 'Massive 2-hour block conquered & stored!'],
        extraHourDone: ['1-Hour Session complete!', 'Bonus 1-hour grind locked in!'],
        postureDone: ['Height & Posture complete!', 'Spine decompressed — sleep like a champion!'],
        staminaFinisherDone: ['Gold Finisher conquered!', 'Heart & lungs leveled up!'],
      };
      if (nextVal) {
        notify(labels[field][0], labels[field][1], 'celebrate', true);
      } else {
        notify('Status updated', 'Checklist item reopened.', 'info');
      }
    },
    [logs, notify, settings.hapticsEnabled, todayDayKey, todayISO, updateDayLog]
  );

  const finalizeDayRank = useCallback(
    (dayKey: DayKey = todayDayKey, dateISO: string = todayISO) => {
      const dayPlan = plan[dayKey];
      const progress = logs[dateISO] ?? createEmptyDailyProgress(dateISO, dayKey);
      const summary = computeChecklistSummary(dayPlan, progress, settings.stepGoal);
      updateDayLog(dateISO, dayKey, (prev) => ({
        ...prev,
        rank: summary.rank,
        missedCount: summary.missedCount,
        revealedAt: new Date().toISOString(),
      }));
      triggerHaptic(summary.rank === 'DEMON' ? 'success' : 'medium', settings.hapticsEnabled);
      notify(
        `Rank Unlocked: ${summary.rank}!`,
        `${summary.completionPct}% done · ${summary.missedCount} missed today.`,
        'rank',
        settings.notifications.nightRankResult
      );
      return summary;
    },
    [
      logs,
      notify,
      plan,
      settings.hapticsEnabled,
      settings.notifications.nightRankResult,
      settings.stepGoal,
      todayDayKey,
      todayISO,
      updateDayLog,
    ]
  );

  // Plan editor actions
  const cycleExercisePriority = useCallback(
    (dayKey: DayKey, exerciseId: string) => {
      triggerHaptic('light', settings.hapticsEnabled);
      const order: PriorityLevel[] = ['R', 'B', 'G'];
      let nextP: PriorityLevel = 'R';
      setPlan((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          exercises: prev[dayKey].exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex;
            nextP = order[(order.indexOf(ex.priority) + 1) % order.length];
            return { ...ex, priority: nextP };
          }),
        },
      }));
      notify('Priority updated', `Switched exercise priority to [${nextP}].`, 'boost');
    },
    [notify, settings.hapticsEnabled]
  );

  const upsertExercise = useCallback(
    (dayKey: DayKey, exercise: ExerciseItem) => {
      setPlan((prev) => {
        const exists = prev[dayKey].exercises.some((e) => e.id === exercise.id);
        const exercises = exists
          ? prev[dayKey].exercises.map((e) => (e.id === exercise.id ? exercise : e))
          : [...prev[dayKey].exercises, exercise];
        return {
          ...prev,
          [dayKey]: {
            ...prev[dayKey],
            exercises,
          },
        };
      });
      notify('Plan saved offline!', `${exercise.name} updated for ${dayKey}.`, 'celebrate');
    },
    [notify]
  );

  const deleteExercise = useCallback(
    (dayKey: DayKey, exerciseId: string) => {
      setPlan((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          exercises: prev[dayKey].exercises.filter((e) => e.id !== exerciseId),
        },
      }));
      notify('Exercise removed', `Removed from ${dayKey} and saved offline.`, 'info');
    },
    [notify]
  );

  const resetDefaultPlan = useCallback(() => {
    setPlan(INITIAL_WEEK_PLAN);
    notify('Plan restored', 'Pre-loaded QINXVI 7-day plan restored.', 'info');
  }, [notify]);

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
      if (patch.darkSurface !== undefined) {
        notify(
          patch.darkSurface ? 'Charcoal theme active' : 'Light studio active',
          'Theme preference saved offline.',
          'boost'
        );
      } else {
        notify('Settings saved', 'Preferences stored offline.', 'info');
      }
    },
    [notify]
  );

  const exportBackupJSON = useCallback(() => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        plan,
        logs,
        settings,
        notificationHistory,
      },
      null,
      2
    );
  }, [logs, notificationHistory, plan, settings]);

  // Computed analytics
  const rankHistory: RankHistoryEntry[] = useMemo(() => {
    const entries: RankHistoryEntry[] = Object.values(logs)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
      .map((entry) => {
        const dp = plan[entry.dayKey] ?? plan[DAY_ORDER[0]];
        const sum = computeChecklistSummary(dp, entry, settings.stepGoal);
        return {
          dateISO: entry.dateISO,
          dayKey: entry.dayKey,
          rank: entry.rank ?? sum.rank,
          missedCount: entry.missedCount ?? sum.missedCount,
          completionPct: sum.completionPct,
        };
      });
    return entries;
  }, [logs, plan, settings.stepGoal]);

  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...rankHistory].reverse();
    for (const item of sorted) {
      if (item.rank === 'DEMON' || item.rank === 'BEAST') {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  }, [rankHistory]);

  return {
    plan,
    logs,
    settings,
    unlocked,
    todayISO,
    todayDayKey,
    todayProgress,
    rankHistory,
    streak,
    activeToasts,
    notificationHistory,
    notify,
    dismissToast,
    unlockWithCode,
    lockApp,
    getLogForDate,
    toggleExerciseDone,
    updateSetLog,
    addSteps,
    setStepsExact,
    toggleChecklistFlag,
    finalizeDayRank,
    cycleExercisePriority,
    upsertExercise,
    deleteExercise,
    resetDefaultPlan,
    updateSettings,
    exportBackupJSON,
  };
}
