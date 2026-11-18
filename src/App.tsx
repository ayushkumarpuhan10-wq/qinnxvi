import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BarChart3, Calendar, Home, Layers, Settings, Smartphone } from 'lucide-react';
import {
  DAILY_WARMUP_SEQUENCE,
  HEIGHT_POSTURE_SEQUENCE,
  STAMINA_FINISHER_SEQUENCE,
} from './data/program';
import { computeChecklistSummary, useQinxviStore } from './storage/useQinxviStore';
import { ShowcaseScreen } from './screens/ShowcaseScreen';
import { LockScreen } from './screens/LockScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WeekScreen } from './screens/WeekScreen';
import { DayDetailScreen } from './screens/DayDetailScreen';
import { ExerciseScreen } from './screens/ExerciseScreen';
import { SequenceScreen } from './screens/SequenceScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { PlanEditorScreen } from './screens/PlanEditorScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { RankRevealModal } from './screens/RankRevealModal';
import { LiquidGlass } from './components/glass/LiquidGlass';
import { BubblyNotifications } from './components/glass/BubblyNotifications';
import { DayKey } from './types/workout';
import { RankTier } from './theme/tokens';
import { triggerHaptic } from './utils/feedback';

type AppRoute =
  | { name: 'home' }
  | { name: 'week' }
  | { name: 'dayDetail'; day: DayKey }
  | { name: 'exercise'; day: DayKey; exerciseId: string }
  | { name: 'sequence'; kind: 'warmup' | 'posture' | 'finisher' }
  | { name: 'progress' }
  | { name: 'planEditor'; day: DayKey }
  | { name: 'settings' };

export default function App() {
  const store = useQinxviStore();
  // Show Component Showcase screen first so user can verify the Liquid Glass style matches reference image
  const [mode, setMode] = useState<'showcase' | 'app'>('showcase');
  const [route, setRoute] = useState<AppRoute>({ name: 'home' });
  const [selectedWeekDay, setSelectedWeekDay] = useState<DayKey>(store.todayDayKey);
  const [pedometerStatus, setPedometerStatus] = useState<string>('Sync Sensor');
  const [rankReveal, setRankReveal] = useState<{
    rank: RankTier;
    missedCount: number;
    completionPct: number;
  } | null>(null);

  const todayPlan = store.plan[store.todayDayKey];
  const todaySummary = useMemo(
    () => computeChecklistSummary(todayPlan, store.todayProgress, store.settings.stepGoal),
    [todayPlan, store.todayProgress, store.settings.stepGoal]
  );

  // Graceful browser motion pedometer hook
  const handleRequestPedometer = async () => {
    if (typeof window === 'undefined') return;
    try {
      const dm = window.DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (dm && typeof dm.requestPermission === 'function') {
        const perm = await dm.requestPermission();
        setPedometerStatus(perm === 'granted' ? 'Sensor Active' : 'Manual Mode');
      } else if ('DeviceMotionEvent' in window) {
        setPedometerStatus('Sensor Active');
      } else {
        setPedometerStatus('Manual Mode');
      }
    } catch {
      setPedometerStatus('Manual Mode');
    }
  };

  useEffect(() => {
    if (pedometerStatus !== 'Sensor Active') return;
    let lastMag = 9.8;
    let lastStepTs = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);
      const now = Date.now();
      if (Math.abs(mag - lastMag) > 3.2 && now - lastStepTs > 350) {
        lastStepTs = now;
        store.addSteps(1);
      }
      lastMag = mag;
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [pedometerStatus, store]);

  const darkSurface = store.settings.darkSurface;

  // Custom-interval bubbly workout reminders for 2-hr and 1-hr sessions
  useEffect(() => {
    if (!store.unlocked) return;
    const notif = store.settings.notifications;
    const timers: number[] = [];

    if (notif.twoHourSessionReminder && notif.twoHourSessionIntervalMin > 0) {
      const ms = Math.max(1, notif.twoHourSessionIntervalMin) * 60000;
      const id = window.setInterval(() => {
        store.notify(
          '2-Hour Session Pulse!',
          `Main workout block check-in (${notif.twoHourSessionIntervalMin}m interval) — stay locked in!`,
          'boost',
          true
        );
      }, ms);
      timers.push(id);
    }

    if (notif.oneHourSessionReminder && notif.oneHourSessionIntervalMin > 0) {
      const ms = Math.max(1, notif.oneHourSessionIntervalMin) * 60000;
      const id = window.setInterval(() => {
        store.notify(
          '1-Hour Session Spark!',
          `Secondary 1-hr conditioning check-in (${notif.oneHourSessionIntervalMin}m interval)!`,
          'celebrate',
          true
        );
      }, ms);
      timers.push(id);
    }

    return () => {
      timers.forEach((id) => window.clearInterval(id));
    };
  }, [
    store.unlocked,
    store.settings.notifications.twoHourSessionReminder,
    store.settings.notifications.twoHourSessionIntervalMin,
    store.settings.notifications.oneHourSessionReminder,
    store.settings.notifications.oneHourSessionIntervalMin,
    store.notify,
  ]);

  const renderAppScreen = () => {
    if (!store.unlocked) {
      return (
        <LockScreen
          onUnlock={store.unlockWithCode}
          darkSurface={darkSurface}
          onOpenShowcase={() => setMode('showcase')}
        />
      );
    }

    switch (route.name) {
      case 'home':
        return (
          <HomeScreen
            todayPlan={todayPlan}
            todayProgress={store.todayProgress}
            summary={todaySummary}
            stepGoal={store.settings.stepGoal}
            streak={store.streak}
            darkSurface={darkSurface}
            onStartDayDetail={() => setRoute({ name: 'dayDetail', day: store.todayDayKey })}
            onStartWarmup={() => setRoute({ name: 'sequence', kind: 'warmup' })}
            onStartPosture={() => setRoute({ name: 'sequence', kind: 'posture' })}
            onStartFinisher={() => setRoute({ name: 'sequence', kind: 'finisher' })}
            onAddSteps={(d) => store.addSteps(d)}
            onToggleMainSession={() => store.toggleChecklistFlag('mainSessionDone')}
            onToggleExtraHour={() => store.toggleChecklistFlag('extraHourDone')}
            onRevealRank={() => {
              const res = store.finalizeDayRank();
              setRankReveal({
                rank: res.rank,
                missedCount: res.missedCount,
                completionPct: res.completionPct,
              });
            }}
            pedometerStatus={pedometerStatus}
            onRequestPedometer={handleRequestPedometer}
          />
        );

      case 'week':
        return (
          <WeekScreen
            plan={store.plan}
            selectedDay={selectedWeekDay}
            todayDayKey={store.todayDayKey}
            darkSurface={darkSurface}
            onSelectDay={setSelectedWeekDay}
            onOpenDayDetail={(day) => setRoute({ name: 'dayDetail', day })}
          />
        );

      case 'dayDetail': {
        const dp = store.plan[route.day];
        const isToday = route.day === store.todayDayKey;
        const progress = isToday
          ? store.todayProgress
          : store.getLogForDate(`preview-${route.day}`, route.day);
        return (
          <DayDetailScreen
            dayPlan={dp}
            progress={progress}
            darkSurface={darkSurface}
            onBack={() => setRoute({ name: 'week' })}
            onStartFirstIncomplete={() => {
              const target =
                dp.exercises.find((e) => !progress.exercises[e.id]?.completed) ?? dp.exercises[0];
              if (target) {
                setRoute({ name: 'exercise', day: route.day, exerciseId: target.id });
              }
            }}
            onOpenExercise={(ex) =>
              setRoute({ name: 'exercise', day: route.day, exerciseId: ex.id })
            }
            onToggleExercise={(ex) =>
              store.toggleExerciseDone(
                route.day,
                ex,
                isToday ? store.todayISO : `preview-${route.day}`
              )
            }
            onCyclePriority={store.cycleExercisePriority}
            onToggleExtraHour={() =>
              store.toggleChecklistFlag(
                'extraHourDone',
                undefined,
                isToday ? store.todayISO : `preview-${route.day}`,
                route.day
              )
            }
            onOpenPlanEditor={() => setRoute({ name: 'planEditor', day: route.day })}
          />
        );
      }

      case 'exercise': {
        const dp = store.plan[route.day];
        const idx = dp.exercises.findIndex((e) => e.id === route.exerciseId);
        const ex = dp.exercises[idx] ?? dp.exercises[0];
        if (!ex) return null;
        const isToday = route.day === store.todayDayKey;
        const dateKey = isToday ? store.todayISO : `preview-${route.day}`;
        const progress = isToday ? store.todayProgress : store.getLogForDate(dateKey, route.day);
        const nextEx = idx + 1 < dp.exercises.length ? dp.exercises[idx + 1] : undefined;

        return (
          <ExerciseScreen
            exercise={ex}
            log={progress.exercises[ex.id]}
            units={store.settings.units}
            soundEnabled={store.settings.soundEnabled}
            hapticsEnabled={store.settings.hapticsEnabled}
            restAlertsEnabled={store.settings.notifications.restTimerAlert}
            darkSurface={darkSurface}
            onBack={() => setRoute({ name: 'dayDetail', day: route.day })}
            onUpdateSet={(setIdx, patch) =>
              store.updateSetLog(route.day, ex, setIdx, patch, dateKey)
            }
            onNotify={store.notify}
            onNextExercise={
              nextEx
                ? () => setRoute({ name: 'exercise', day: route.day, exerciseId: nextEx.id })
                : undefined
            }
          />
        );
      }

      case 'sequence': {
        if (route.kind === 'warmup') {
          return (
            <SequenceScreen
              title="daily warm-up"
              subtitle="10 min · 10 moves"
              trainingType="Stretch"
              steps={DAILY_WARMUP_SEQUENCE}
              soundEnabled={store.settings.soundEnabled}
              hapticsEnabled={store.settings.hapticsEnabled}
              darkSurface={darkSurface}
              onBack={() => setRoute({ name: 'home' })}
              onCompleteSequence={() => store.toggleChecklistFlag('warmupDone', true)}
            />
          );
        }
        if (route.kind === 'posture') {
          return (
            <SequenceScreen
              title="height & posture"
              subtitle="Daily evening · 10–15 min"
              trainingType="Stretch"
              steps={HEIGHT_POSTURE_SEQUENCE}
              soundEnabled={store.settings.soundEnabled}
              hapticsEnabled={store.settings.hapticsEnabled}
              darkSurface={darkSurface}
              onBack={() => setRoute({ name: 'home' })}
              onCompleteSequence={() => store.toggleChecklistFlag('postureDone', true)}
            />
          );
        }
        // Stamina Finisher: 5 rounds x 4 exercises
        const expandedFinisher = Array.from({ length: 5 }, (_, r) =>
          STAMINA_FINISHER_SEQUENCE.map((item) => ({
            ...item,
            id: `${item.id}-r${r + 1}`,
            setsLabel: `Round ${r + 1}/5`,
          }))
        ).flat();
        return (
          <SequenceScreen
            title="stamina finisher"
            subtitle="2x/week · 10 min · 5 rounds"
            trainingType="Stamina"
            steps={expandedFinisher}
            soundEnabled={store.settings.soundEnabled}
            hapticsEnabled={store.settings.hapticsEnabled}
            darkSurface={darkSurface}
            onBack={() => setRoute({ name: 'home' })}
            onCompleteSequence={() => store.toggleChecklistFlag('staminaFinisherDone', true)}
          />
        );
      }

      case 'progress':
        return (
          <ProgressScreen
            plan={store.plan}
            logs={store.logs}
            rankHistory={store.rankHistory}
            streak={store.streak}
            stepGoal={store.settings.stepGoal}
            units={store.settings.units}
            darkSurface={darkSurface}
          />
        );

      case 'planEditor':
        return (
          <PlanEditorScreen
            plan={store.plan}
            initialDay={route.day}
            darkSurface={darkSurface}
            onBack={() => setRoute({ name: 'dayDetail', day: route.day })}
            onUpsertExercise={store.upsertExercise}
            onDeleteExercise={store.deleteExercise}
            onResetPlan={store.resetDefaultPlan}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            settings={store.settings}
            notificationHistory={store.notificationHistory}
            onUpdateSettings={store.updateSettings}
            onSendBubblyTest={() =>
              store.notify(
                'Sparkle Alert!',
                'Everything you log pops a bubbly uplift & saves offline!',
                'celebrate',
                true
              )
            }
            onExportBackup={store.exportBackupJSON}
            onLockApp={store.lockApp}
            onOpenShowcase={() => setMode('showcase')}
            onOpenPlanEditor={() => setRoute({ name: 'planEditor', day: store.todayDayKey })}
          />
        );
    }
  };

  const activeBottomTab =
    route.name === 'home' || route.name === 'sequence'
      ? 'home'
      : route.name === 'week' || route.name === 'dayDetail' || route.name === 'exercise' || route.name === 'planEditor'
        ? 'week'
        : route.name === 'progress'
          ? 'progress'
          : 'settings';

  return (
    <motion.div
      layout
      animate={{ color: darkSurface ? '#f4f5f8' : '#111318' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="lg-studio-canvas relative min-h-dvh w-full"
    >
      {/* Cross-fading charcoal surface layer for smooth theme transition */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: darkSurface ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="lg-studio-canvas-dark pointer-events-none fixed inset-0 z-0"
      />

      {/* Bubbly In-App Liquid Glass Notification Stack */}
      <BubblyNotifications toasts={store.activeToasts} onDismiss={store.dismissToast} />

      <div className="relative z-10">
      {/* Top Bar Mode Switcher (Showcase <-> 390x844 Mobile App) */}
      <header
        className={`sticky top-0 z-40 border-b px-4 py-2.5 backdrop-blur-xl transition-colors duration-300 ${
          darkSurface
            ? 'border-white/10 bg-[#1b1d24]/80'
            : 'border-black/8 bg-white/45'
        }`}
      >
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4">
          <motion.span
            animate={{ color: darkSurface ? '#ffffff' : '#111318' }}
            transition={{ duration: 0.35 }}
            className="text-lg font-extrabold tracking-[-0.04em] lowercase whitespace-nowrap"
          >
            qinxvi
          </motion.span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('showcase')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                mode === 'showcase'
                  ? darkSurface
                    ? 'bg-white text-[#111318] shadow-sm'
                    : 'bg-[#111318] text-white shadow-sm'
                  : darkSurface
                    ? 'text-white/75 hover:bg-white/10'
                    : 'text-[#323643] hover:bg-black/8'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Component Showcase
            </button>
            <button
              type="button"
              onClick={() => setMode('app')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                mode === 'app'
                  ? darkSurface
                    ? 'bg-white text-[#111318] shadow-sm'
                    : 'bg-[#111318] text-white shadow-sm'
                  : darkSurface
                    ? 'text-white/75 hover:bg-white/10'
                    : 'text-[#323643] hover:bg-black/8'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              QINXVI App (390×844)
            </button>
          </div>
        </div>
      </header>

      {mode === 'showcase' ? (
        <ShowcaseScreen
          onEnterApp={() => setMode('app')}
          darkSurface={darkSurface}
          onToggleSurface={(v) => store.updateSettings({ darkSurface: v })}
        />
      ) : (
        <main className="mx-auto flex max-w-[1160px] flex-col items-center justify-center px-0 py-0 sm:px-6 sm:py-6">
          {/* 390x844 Mobile-first Portrait Stage on Desktop, Edge-to-edge on Phone */}
          <motion.div
            layout
            animate={{
              borderColor: darkSurface ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
              color: darkSurface ? '#f4f5f8' : '#111318',
            }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg-studio-canvas relative w-full sm:w-[390px] sm:h-[844px] sm:rounded-[44px] sm:border sm:shadow-[0_32px_80px_-20px_rgba(17,19,24,0.38)] overflow-hidden flex flex-col"
          >
            <motion.div
              aria-hidden="true"
              initial={false}
              animate={{ opacity: darkSurface ? 1 : 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="lg-studio-canvas-dark pointer-events-none absolute inset-0 z-0"
            />
            <div className="lg-scroll relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={store.unlocked ? route.name : 'lock'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderAppScreen()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Liquid Glass Tab Bar (when unlocked) */}
            {store.unlocked && (
              <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30">
                <LiquidGlass variant="primary" shape="pill" className="pointer-events-auto px-2 py-1.5">
                  <nav className="grid grid-cols-4 items-center">
                    {[
                      { id: 'home', label: 'Today', icon: Home, onTap: () => setRoute({ name: 'home' }) },
                      { id: 'week', label: 'Week', icon: Calendar, onTap: () => setRoute({ name: 'week' }) },
                      { id: 'progress', label: 'Progress', icon: BarChart3, onTap: () => setRoute({ name: 'progress' }) },
                      { id: 'settings', label: 'Settings', icon: Settings, onTap: () => setRoute({ name: 'settings' }) },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = activeBottomTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic('tabSnap');
                            tab.onTap();
                          }}
                          className={`flex h-12 flex-col items-center justify-center rounded-full transition ${
                            active
                              ? 'bg-white/16 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5" strokeWidth={active ? 2.4 : 1.9} />
                          <span className="mt-0.5 text-[10px] font-semibold">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </LiquidGlass>
              </div>
            )}
          </motion.div>
        </main>
      )}
      </div>

      {/* Full-Screen Animated Rank Reveal Modal */}
      <AnimatePresence>
        {rankReveal && (
          <RankRevealModal
            rank={rankReveal.rank}
            missedCount={rankReveal.missedCount}
            completionPct={rankReveal.completionPct}
            streak={store.streak}
            onClose={() => setRankReveal(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
