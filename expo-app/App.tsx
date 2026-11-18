import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import {
  DAILY_WARMUP_SEQUENCE,
  DAY_ORDER,
  HEIGHT_POSTURE_SEQUENCE,
  INITIAL_WEEK_PLAN,
} from './src/data/program';
import { DEFAULT_SETTINGS, QinxviStorage } from './src/storage/database';
import {
  scheduleQinxviNotifications,
  triggerBubblyTaskNotification,
  triggerTimerFinishedNotification,
} from './src/services/notifications';
import { subscribeTodaySteps } from './src/services/pedometer';
import { triggerExpoHaptic } from './src/utils/haptics';
import { LiquidGlass } from './src/components/glass/LiquidGlass';
import {
  GlassButton,
  GlassIconButton,
  GlassInput,
  GlassProgressRing,
  GlassSelect,
  GlassSwitch,
} from './src/components/glass/GlassComponents';
import { PRIORITY_TOKENS, RankTier, TYPE_TOKENS } from './src/theme/tokens';
import { AppSettings, DailyProgress, DayKey, DayPlan, ExerciseItem } from './src/types/workout';

type ScreenName =
  | 'showcase'
  | 'lock'
  | 'home'
  | 'week'
  | 'dayDetail'
  | 'exercise'
  | 'warmup'
  | 'posture'
  | 'progress'
  | 'planEditor'
  | 'settings';

function getTodayKey(): DayKey {
  const map: DayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[new Date().getDay()];
}

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('showcase');
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [plan, setPlan] = useState<Record<DayKey, DayPlan>>(INITIAL_WEEK_PLAN);
  const [logs, setLogs] = useState<Record<string, DailyProgress>>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedDay, setSelectedDay] = useState<DayKey>(getTodayKey());
  const [activeExerciseId, setActiveExerciseId] = useState<string>('');
  const [rankModal, setRankModal] = useState<RankTier | null>(null);

  // Showcase interactive states
  const [demoSwitch, setDemoSwitch] = useState(true);
  const [demoSelect, setDemoSelect] = useState(true);
  const [demoText, setDemoText] = useState('');

  // Timer state (timestamp-based for background survival)
  const [timerSec, setTimerSec] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerEndRef = useRef<number | null>(null);

  // Warmup/Posture sequence state
  const [seqIndex, setSeqIndex] = useState(0);
  const [seqSec, setSeqSec] = useState(60);
  const [seqRunning, setSeqRunning] = useState(false);
  const seqEndRef = useRef<number | null>(null);

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const todayISO = getTodayISO();
  const todayKey = getTodayKey();

  useEffect(() => {
    (async () => {
      const [p, l, s] = await Promise.all([
        QinxviStorage.loadPlan(),
        QinxviStorage.loadLogs(),
        QinxviStorage.loadSettings(),
      ]);
      setPlan(p);
      setLogs(l);
      setSettings(s);
    })();
  }, []);

  useEffect(() => {
    let cleanup = () => {};
    subscribeTodaySteps((steps) => {
      updateToday((prev) => ({ ...prev, steps }));
    }).then((unsub) => {
      cleanup = unsub;
    });
    return () => cleanup();
  }, []);

  const todayProgress: DailyProgress = logs[todayISO] ?? {
    dateISO: todayISO,
    dayKey: todayKey,
    exercises: {},
    warmupDone: false,
    mainSessionDone: false,
    extraHourDone: false,
    postureDone: false,
    staminaFinisherDone: false,
    steps: 0,
  };

  const updateToday = (updater: (prev: DailyProgress) => DailyProgress) => {
    setLogs((prev) => {
      const current = prev[todayISO] ?? {
        dateISO: todayISO,
        dayKey: todayKey,
        exercises: {},
        warmupDone: false,
        mainSessionDone: false,
        extraHourDone: false,
        postureDone: false,
        staminaFinisherDone: false,
        steps: 0,
      };
      const next = { ...prev, [todayISO]: updater(current) };
      QinxviStorage.saveLogs(next);
      return next;
    });
  };

  const todayPlan = plan[todayKey];
  const checklist = useMemo(() => {
    const doneEx = todayPlan.exercises.filter((e) => todayProgress.exercises[e.id]?.completed).length;
    const total = todayPlan.exercises.length + 3;
    const done =
      doneEx +
      (todayProgress.warmupDone ? 1 : 0) +
      (todayProgress.steps >= settings.stepGoal ? 1 : 0) +
      (todayProgress.extraHourDone ? 1 : 0);
    const missed = Math.max(0, total - done);
    const rank: RankTier = missed === 0 ? 'DEMON' : missed <= 2 ? 'BEAST' : 'LOSER';
    return { done, total, missed, pct: Math.round((done / total) * 100), rank };
  }, [todayPlan, todayProgress, settings.stepGoal]);

  // Background-safe exercise timer with final-3s tick haptics
  useEffect(() => {
    if (!timerRunning) {
      timerEndRef.current = null;
      return;
    }
    if (!timerEndRef.current) timerEndRef.current = Date.now() + timerSec * 1000;
    let lastTick = -1;
    const id = setInterval(() => {
      if (!timerEndRef.current) return;
      const rem = Math.max(0, Math.ceil((timerEndRef.current - Date.now()) / 1000));
      setTimerSec(rem);
      if (rem > 0 && rem <= 3 && rem !== lastTick) {
        lastTick = rem;
        triggerExpoHaptic('tick');
      }
      if (rem <= 0) {
        lastTick = -1;
        setTimerRunning(false);
        timerEndRef.current = null;
        triggerExpoHaptic('celebrate');
        if (settings.notifications.restTimerAlert) {
          triggerTimerFinishedNotification('Exercise');
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [timerRunning]);

  // Sequence timer (Warm-up & Height/Posture) with tick + pulse haptics
  const activeSequence = screen === 'posture' ? HEIGHT_POSTURE_SEQUENCE : DAILY_WARMUP_SEQUENCE;
  useEffect(() => {
    if (!seqRunning) {
      seqEndRef.current = null;
      return;
    }
    if (!seqEndRef.current) seqEndRef.current = Date.now() + seqSec * 1000;
    let lastTick = -1;
    const id = setInterval(() => {
      if (!seqEndRef.current) return;
      const rem = Math.max(0, Math.ceil((seqEndRef.current - Date.now()) / 1000));
      setSeqSec(rem);
      if (rem > 0 && rem <= 3 && rem !== lastTick) {
        lastTick = rem;
        triggerExpoHaptic('tick');
      }
      if (rem <= 0) {
        lastTick = -1;
        if (seqIndex + 1 < activeSequence.length) {
          const next = seqIndex + 1;
          setSeqIndex(next);
          const dur = activeSequence[next].durationSec;
          setSeqSec(dur);
          seqEndRef.current = Date.now() + dur * 1000;
          triggerExpoHaptic('pulse');
        } else {
          setSeqRunning(false);
          seqEndRef.current = null;
          updateToday((p) =>
            screen === 'posture' ? { ...p, postureDone: true } : { ...p, warmupDone: true }
          );
          triggerExpoHaptic('celebrate');
          triggerBubblyTaskNotification(
            screen === 'posture' ? 'Height & Posture Routine' : 'Daily Warm-up',
            'Sequence completed!',
            settings.notifications.bubblyTaskPush
          );
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [seqRunning, seqIndex, screen]);

  const handleUnlock = () => {
    if (codeInput.trim().toUpperCase() === 'QINXVI') {
      setCodeError(false);
      setUnlocked(true);
      setScreen('home');
      triggerExpoHaptic('celebrate');
      triggerBubblyTaskNotification('Unlocked QINXVI', 'Your 2-hr + 1-hr sessions await!', settings.notifications.bubblyTaskPush);
    } else {
      setCodeError(true);
      triggerExpoHaptic('error');
      shakeX.value = withSequence(
        withTiming(-12, { duration: 60 }),
        withTiming(12, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  };

  const activeDayPlan = plan[selectedDay];
  const activeExercise: ExerciseItem | undefined =
    activeDayPlan.exercises.find((e) => e.id === activeExerciseId) ?? activeDayPlan.exercises[0];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {screen === 'showcase' && (
          <View style={styles.gap}>
            <Text style={styles.pageTitle}>liquid glass</Text>
            <GlassButton label="Start workout" variant="primary" onPress={() => setScreen(unlocked ? 'home' : 'lock')} />
            <GlassButton label="Secondary" variant="secondary" onPress={() => setDemoSelect((v) => !v)} />
            <GlassIconButton iconName="locate-outline" label="Icon button" variant="cyan" onPress={() => setScreen(unlocked ? 'home' : 'lock')} />
            <GlassInput value={demoText} onChangeText={setDemoText} placeholder="Text field" />
            <GlassSelect label="Select" selected={demoSelect} onToggle={() => setDemoSelect((v) => !v)} />
            <GlassSwitch label="Switch" value={demoSwitch} onValueChange={setDemoSwitch} />

            {/* Multi-Shape Liquid Glass Geometry Showcase: Circle, Square, Squircle, Diamond, Arch, Bevel */}
            <View style={styles.shapesRow}>
              <LiquidGlass variant="cyan" shape="circle" haptic="medium" onPress={() => {}} style={{ width: 68 }}>
                <Text style={styles.shapeLabel}>Circle</Text>
              </LiquidGlass>
              <LiquidGlass variant="secondary" shape="square" haptic="heavy" onPress={() => {}} style={{ width: 68 }}>
                <Text style={styles.shapeLabel}>Square</Text>
              </LiquidGlass>
              <LiquidGlass variant="goldGreen" shape="squircle" haptic="pulse" onPress={() => {}} style={{ width: 68, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.shapeLabel}>Squircle</Text>
              </LiquidGlass>
              <LiquidGlass variant="primary" shape="diamond" haptic="rankReveal" onPress={() => {}} style={{ width: 58 }}>
                <Text style={styles.shapeLabel}>Gem</Text>
              </LiquidGlass>
            </View>

            <View style={styles.twoCol}>
              <LiquidGlass variant="cyan" shape="arch" haptic="celebrate" onPress={() => {}} style={{ flex: 1, padding: 14 }}>
                <Text style={styles.shapeLabel}>Arch Portal</Text>
              </LiquidGlass>
              <LiquidGlass variant="secondary" shape="bevel" haptic="toggleOn" onPress={() => {}} style={{ flex: 1, padding: 14 }}>
                <Text style={styles.shapeLabel}>Kinetic Bevel</Text>
              </LiquidGlass>
            </View>

            <LiquidGlass variant="primary" shape="card" style={{ padding: 16 }}>
              <Text style={styles.cardTitle}>{'< Tabs'}</Text>
              <Text style={styles.cardSub}>Find files...</Text>
              <Text style={styles.cardSub}>Add collaborator</Text>
            </LiquidGlass>
            <LiquidGlass variant="cyan" shape="card" style={{ padding: 16 }}>
              <Text style={styles.cardTitle}>Pro plan</Text>
              <Text style={styles.cardSub}>Focus ring, hover states, Disabled states · 3</Text>
            </LiquidGlass>
            <GlassButton label="Launch QINXVI App" variant="secondary" haptic="double" onPress={() => setScreen(unlocked ? 'home' : 'lock')} />
          </View>
        )}

        {screen === 'lock' && (
          <Animated.View style={[styles.gap, shakeStyle, { marginTop: 60 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.pageTitle}>qinxvi</Text>
              <LiquidGlass variant="cyan" shape="diamond" style={{ width: 52 }}>
                <Text style={styles.shapeLabel}>LOCK</Text>
              </LiquidGlass>
            </View>
            <LiquidGlass variant="primary" shape="arch" errorGlow={codeError} style={{ padding: 18 }}>
              <View style={{ gap: 12 }}>
                <GlassInput
                  value={codeInput}
                  onChangeText={(t) => {
                    setCodeInput(t);
                    setCodeError(false);
                  }}
                  placeholder="Access code (QINXVI)"
                  onSubmit={handleUnlock}
                  errorGlow={codeError}
                />
                {codeError && <Text style={styles.errText}>Wrong code. Enter QINXVI.</Text>}
                <GlassButton label="Unlock" variant="secondary" haptic="double" onPress={handleUnlock} />
              </View>
            </LiquidGlass>
            <GlassButton label="Back to Showcase" variant="primary" onPress={() => setScreen('showcase')} />
          </Animated.View>
        )}

        {screen === 'home' && (
          <View style={styles.gap}>
            <Text style={styles.pageTitle}>today</Text>
            <View style={styles.twoCol}>
              <GlassProgressRing progress={checklist.pct / 100} valueLabel={`${checklist.pct}%`} caption={`${checklist.done}/${checklist.total} items`} achieved={checklist.missed === 0} />
              <GlassProgressRing progress={todayProgress.steps / settings.stepGoal} valueLabel={`${todayProgress.steps}`} caption={`/ ${settings.stepGoal} steps`} achieved={todayProgress.steps >= settings.stepGoal} />
            </View>
            {/* Session 1: 2-Hour Main Workout (Arch Silhouette) */}
            <LiquidGlass trainingType={todayPlan.primaryType} shape="arch" haptic="medium" style={{ padding: 16 }} onPress={() => { setSelectedDay(todayKey); setScreen('dayDetail'); }}>
              <Text style={styles.cardTitle}>Session 1 (2 hr) · {todayPlan.day}: {todayPlan.title}</Text>
              <Text style={styles.cardSub}>{todayPlan.exercises.length} exercises · Tap to train</Text>
            </LiquidGlass>
            <GlassSelect
              label="2-Hour Main Session Complete"
              sublabel="Mark full 2-hr block finished"
              selected={Boolean(todayProgress.mainSessionDone)}
              onToggle={() => {
                const next = !todayProgress.mainSessionDone;
                updateToday((p) => ({ ...p, mainSessionDone: next }));
                triggerExpoHaptic(next ? 'celebrate' : 'toggleOff');
                if (next) {
                  triggerBubblyTaskNotification('2-Hour Main Session', 'Huge block conquered!', settings.notifications.bubblyTaskPush);
                }
              }}
              trainingType={todayPlan.primaryType}
            />
            {/* Session 2: 1-Hour Secondary Workout (Kinetic Bevel) */}
            <GlassSelect
              label={`Session 2 (1 hr): ${todayPlan.extraHour.title}`}
              sublabel={`60 min · ${todayPlan.extraHour.type}`}
              selected={todayProgress.extraHourDone}
              shape="bevel"
              onToggle={() => {
                const next = !todayProgress.extraHourDone;
                updateToday((p) => ({ ...p, extraHourDone: next }));
                triggerExpoHaptic(next ? 'celebrate' : 'toggleOff');
                if (next) {
                  triggerBubblyTaskNotification('1-Hour Secondary Session', todayPlan.extraHour.title, settings.notifications.bubblyTaskPush);
                }
              }}
              trainingType={todayPlan.extraHour.type}
            />
            {/* Circular Step Boost Orbs */}
            <View style={styles.shapesRow}>
              {[1500, 3500, 5000].map((amt) => (
                <LiquidGlass
                  key={amt}
                  variant="cyan"
                  shape="circle"
                  haptic="selection"
                  style={{ width: 84 }}
                  onPress={() => {
                    const nextSteps = todayProgress.steps + amt;
                    updateToday((p) => ({ ...p, steps: nextSteps }));
                    triggerExpoHaptic(nextSteps >= settings.stepGoal ? 'celebrate' : 'success');
                    triggerBubblyTaskNotification(
                      nextSteps >= settings.stepGoal ? '10,000 Steps Unlocked!' : `+${amt} Steps Logged`,
                      `Total today: ${nextSteps}`,
                      settings.notifications.bubblyTaskPush
                    );
                  }}
                >
                  <Text style={styles.shapeLabel}>+{(amt / 1000).toFixed(1)}k</Text>
                </LiquidGlass>
              ))}
            </View>
            <View style={styles.twoCol}>
              <LiquidGlass variant="cyan" shape="square" haptic="medium" style={{ flex: 1, padding: 14 }} onPress={() => { setSeqIndex(0); setSeqSec(DAILY_WARMUP_SEQUENCE[0].durationSec); setSeqRunning(false); setScreen('warmup'); }}>
                <Text style={styles.cardTitle}>Warm-up</Text>
                <Text style={styles.cardSub}>10 min flow</Text>
              </LiquidGlass>
              <LiquidGlass variant="primary" shape="square" haptic="medium" style={{ flex: 1, padding: 14 }} onPress={() => { setSeqIndex(0); setSeqSec(HEIGHT_POSTURE_SEQUENCE[0].durationSec); setSeqRunning(false); setScreen('posture'); }}>
                <Text style={styles.cardTitle}>Posture</Text>
                <Text style={styles.cardSub}>12 min spine</Text>
              </LiquidGlass>
            </View>
            <GlassButton
              label={`Reveal Rank (${checklist.rank})`}
              variant="secondary"
              haptic="rankReveal"
              onPress={() => {
                setRankModal(checklist.rank);
                triggerExpoHaptic('rankReveal');
                triggerBubblyTaskNotification(`Rank: ${checklist.rank}`, `${checklist.pct}% complete today!`, settings.notifications.bubblyTaskPush);
              }}
            />
          </View>
        )}

        {screen === 'week' && (
          <View style={styles.gap}>
            <Text style={styles.pageTitle}>week</Text>
            {DAY_ORDER.map((d) => (
              <LiquidGlass
                key={d}
                trainingType={plan[d].primaryType}
                shape={plan[d].isRestDay ? 'bevel' : 'arch'}
                haptic="medium"
                style={{ padding: 16 }}
                onPress={() => { setSelectedDay(d); setScreen('dayDetail'); }}
              >
                <Text style={styles.cardTitle}>{plan[d].day} — {plan[d].title}</Text>
                <Text style={styles.cardSub}>2 hr + 1 hr · {plan[d].exercises.length} exercises · {TYPE_TOKENS[plan[d].primaryType].label}</Text>
              </LiquidGlass>
            ))}
          </View>
        )}

        {screen === 'dayDetail' && (
          <View style={styles.gap}>
            <Text style={styles.pageTitle}>{activeDayPlan.title.toLowerCase()}</Text>
            {activeDayPlan.exercises.map((ex) => {
              const done = todayProgress.exercises[ex.id]?.completed ?? false;
              const shape = ex.priority === 'R' ? 'arch' : ex.priority === 'B' ? 'card' : 'bevel';
              return (
                <GlassSelect
                  key={ex.id}
                  label={`${ex.name} (${ex.sets}×${ex.reps})`}
                  sublabel={`${ex.type} · [${ex.priority}] ${PRIORITY_TOKENS[ex.priority].label} · ${ex.muscles}`}
                  selected={done}
                  trainingType={ex.type}
                  priority={ex.priority}
                  shape={shape}
                  onToggle={() => {
                    setActiveExerciseId(ex.id);
                    setTimerSec(ex.timer.durationSec);
                    setTimerRunning(false);
                    setScreen('exercise');
                  }}
                />
              );
            })}
          </View>
        )}

        {screen === 'exercise' && activeExercise && (
          <View style={styles.gap}>
            <Text style={styles.pageTitle}>{activeExercise.name.toLowerCase()}</Text>
            <LiquidGlass trainingType={activeExercise.type} priority={activeExercise.priority} shape="arch" style={{ padding: 20 }}>
              <Text style={styles.cardSub}>{activeExercise.sets} × {activeExercise.reps} · {activeExercise.muscles}</Text>
              <Text style={styles.timerDigits}>{String(Math.floor(timerSec / 60)).padStart(2, '0')}:{String(timerSec % 60).padStart(2, '0')}</Text>
              <GlassButton label={timerRunning ? 'Pause Timer' : 'Start Timer'} variant="secondary" haptic={timerRunning ? 'toggleOff' : 'pulse'} onPress={() => setTimerRunning((r) => !r)} />
            </LiquidGlass>
            <GlassButton
              label="Mark Exercise Complete"
              variant="goldGreen"
              haptic="celebrate"
              onPress={() => {
                updateToday((p) => ({
                  ...p,
                  exercises: {
                    ...p.exercises,
                    [activeExercise.id]: { completed: true, sets: p.exercises[activeExercise.id]?.sets ?? [] },
                  },
                }));
                triggerExpoHaptic('celebrate');
                triggerBubblyTaskNotification(activeExercise.name, 'Exercise locked in!', settings.notifications.bubblyTaskPush);
                setScreen('dayDetail');
              }}
            />
          </View>
        )}

        {(screen === 'warmup' || screen === 'posture') && (
          <View style={styles.gap}>
            <Text style={styles.pageTitle}>{screen === 'warmup' ? 'warm-up' : 'height & posture'}</Text>
            <LiquidGlass trainingType="Stretch" shape="arch" style={{ padding: 20 }}>
              <Text style={styles.cardSub}>Move {seqIndex + 1} / {activeSequence.length}</Text>
              <Text style={styles.cardTitle}>{activeSequence[seqIndex]?.name}</Text>
              <Text style={styles.cardSub}>{activeSequence[seqIndex]?.cue}</Text>
              <Text style={styles.timerDigits}>{seqSec}s</Text>
              <GlassButton label={seqRunning ? 'Pause' : 'Start Sequence'} variant="secondary" haptic={seqRunning ? 'toggleOff' : 'pulse'} onPress={() => setSeqRunning((r) => !r)} />
            </LiquidGlass>
          </View>
        )}

        {screen === 'settings' && (
          <View style={styles.gap}>
            <Text style={styles.pageTitle}>settings</Text>
            <GlassSwitch
              label="Require code every launch"
              value={settings.requireCodeEveryLaunch}
              onValueChange={(v) => {
                const next = { ...settings, requireCodeEveryLaunch: v };
                setSettings(next);
                QinxviStorage.saveSettings(next);
              }}
            />
            <GlassSwitch
              label="Bubbly task push alerts"
              value={settings.notifications.bubblyTaskPush}
              onValueChange={(v) => {
                const next = { ...settings, notifications: { ...settings.notifications, bubblyTaskPush: v } };
                setSettings(next);
                QinxviStorage.saveSettings(next);
              }}
            />
            <GlassSwitch
              label="2-Hour Session Reminder"
              value={settings.notifications.twoHourSessionReminder}
              onValueChange={(v) => {
                const next = { ...settings, notifications: { ...settings.notifications, twoHourSessionReminder: v } };
                setSettings(next);
                QinxviStorage.saveSettings(next);
                scheduleQinxviNotifications(next);
              }}
            />
            <View style={styles.intervalRow}>
              {[30, 60, 90, 120].map((mins) => (
                <TouchableOpacity
                  key={`2h-${mins}`}
                  onPress={() => {
                    const next = { ...settings, notifications: { ...settings.notifications, twoHourSessionIntervalMin: mins } };
                    setSettings(next);
                    QinxviStorage.saveSettings(next);
                    scheduleQinxviNotifications(next);
                    triggerExpoHaptic('selection');
                  }}
                  style={[styles.intervalChip, settings.notifications.twoHourSessionIntervalMin === mins && styles.intervalChipActive]}
                >
                  <Text style={styles.intervalText}>{mins}m</Text>
                </TouchableOpacity>
              ))}
            </View>
            <GlassSwitch
              label="1-Hour Session Reminder"
              value={settings.notifications.oneHourSessionReminder}
              onValueChange={(v) => {
                const next = { ...settings, notifications: { ...settings.notifications, oneHourSessionReminder: v } };
                setSettings(next);
                QinxviStorage.saveSettings(next);
                scheduleQinxviNotifications(next);
              }}
            />
            <View style={styles.intervalRow}>
              {[15, 30, 45, 60].map((mins) => (
                <TouchableOpacity
                  key={`1h-${mins}`}
                  onPress={() => {
                    const next = { ...settings, notifications: { ...settings.notifications, oneHourSessionIntervalMin: mins } };
                    setSettings(next);
                    QinxviStorage.saveSettings(next);
                    scheduleQinxviNotifications(next);
                    triggerExpoHaptic('selection');
                  }}
                  style={[styles.intervalChip, settings.notifications.oneHourSessionIntervalMin === mins && styles.intervalChipActive]}
                >
                  <Text style={styles.intervalText}>{mins}m</Text>
                </TouchableOpacity>
              ))}
            </View>
            <GlassSwitch
              label="Daily workout reminder"
              value={settings.notifications.dailyWorkout}
              onValueChange={(v) => {
                const next = { ...settings, notifications: { ...settings.notifications, dailyWorkout: v } };
                setSettings(next);
                QinxviStorage.saveSettings(next);
                scheduleQinxviNotifications(next);
              }}
            />
            <GlassButton label="Component Showcase" variant="primary" onPress={() => setScreen('showcase')} />
          </View>
        )}
      </ScrollView>

      {unlocked && screen !== 'showcase' && screen !== 'lock' && (
        <View style={styles.tabBarWrap}>
          <LiquidGlass variant="primary" shape="pill">
            <View style={styles.tabBar}>
              {(['home', 'week', 'settings'] as ScreenName[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => {
                    triggerExpoHaptic('tabSnap');
                    setScreen(tab);
                  }}
                  style={styles.tabItem}
                >
                  <Text style={[styles.tabLabel, screen === tab && { color: '#FFFFFF', fontWeight: '700' }]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </LiquidGlass>
        </View>
      )}

      <Modal visible={rankModal !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <LiquidGlass variant={rankModal === 'DEMON' ? 'secondary' : 'primary'} shape="squircle" style={{ padding: 28, width: '85%', alignItems: 'center' }}>
            <LiquidGlass variant={rankModal === 'DEMON' ? 'secondary' : 'primary'} shape="diamond" style={{ width: 64, marginBottom: 16 }}>
              <Text style={styles.shapeLabel}>{rankModal}</Text>
            </LiquidGlass>
            <Text style={[styles.pageTitle, { color: '#FFF', textAlign: 'center' }]}>{rankModal}</Text>
            <Text style={[styles.cardSub, { textAlign: 'center', marginBottom: 20 }]}>Missed items: {checklist.missed}</Text>
            <GlassButton label="Close" variant="primary" onPress={() => setRankModal(null)} />
          </LiquidGlass>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1B1D24' },
  scroll: { padding: 18, paddingBottom: 110 },
  gap: { gap: 14 },
  twoCol: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  shapesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  shapeLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  intervalRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', paddingHorizontal: 4 },
  intervalChip: { flex: 1, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  intervalChipActive: { backgroundColor: '#3B82F6' },
  intervalText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  pageTitle: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1, textTransform: 'lowercase' },
  cardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  cardSub: { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 },
  timerDigits: { color: '#FFFFFF', fontSize: 48, fontWeight: '800', textAlign: 'center', marginVertical: 16 },
  errText: { color: '#F87171', fontSize: 13, fontWeight: '600' },
  tabBarWrap: { position: 'absolute', bottom: 18, left: 16, right: 16 },
  tabBar: { flexDirection: 'row', height: 56, alignItems: 'center', justifyContent: 'space-around' },
  tabItem: { paddingHorizontal: 18, paddingVertical: 10 },
  tabLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textTransform: 'capitalize' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
});
