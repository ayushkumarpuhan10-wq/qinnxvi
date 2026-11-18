import React from 'react';
import { Bell, Download, Lock, Sparkles } from 'lucide-react';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassSwitch } from '../components/glass/GlassSwitch';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { AppSettings, BubblyNotificationItem } from '../types/workout';
import { HapticKind, sendLocalNotification, triggerHaptic } from '../utils/feedback';

interface SettingsScreenProps {
  settings: AppSettings;
  notificationHistory: BubblyNotificationItem[];
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onSendBubblyTest: () => void;
  onExportBackup: () => string;
  onLockApp: () => void;
  onOpenShowcase: () => void;
  onOpenPlanEditor: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  notificationHistory,
  onUpdateSettings,
  onSendBubblyTest,
  onExportBackup,
  onLockApp,
  onOpenShowcase,
  onOpenPlanEditor,
}) => {
  const notif = settings.notifications;
  const updateNotif = (patch: Partial<AppSettings['notifications']>) => {
    onUpdateSettings({
      notifications: { ...notif, ...patch },
    });
  };

  const requestWebNotificationPerm = async () => {
    onSendBubblyTest();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        sendLocalNotification('QINXVI Bubbly Alerts Active!', 'Every set, step & session sends an uplift.');
      }
    }
  };

  const handleDownloadBackup = () => {
    const json = onExportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qinxvi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 px-4 pb-28 pt-4">
      <div>
        <p className={`text-xs font-semibold ${settings.darkSurface ? 'text-white/55' : 'text-[#5b6170]'}`}>
          Preferences & Local Alerts
        </p>
        <h1
          className={`text-[34px] font-extrabold tracking-[-0.04em] leading-tight lowercase ${
            settings.darkSurface ? 'text-white' : 'text-[#111318]'
          }`}
        >
          settings
        </h1>
      </div>

      {/* Security & Core Preferences */}
      <div className="space-y-3">
        <GlassSwitch
          label="Require code every launch"
          sublabel="Access code: QINXVI"
          checked={settings.requireCodeEveryLaunch}
          onChange={(v) => onUpdateSettings({ requireCodeEveryLaunch: v })}
        />

        <GlassSwitch
          label="Charcoal background"
          sublabel="Smooth fade between charcoal & light"
          checked={settings.darkSurface}
          onChange={(v) => onUpdateSettings({ darkSurface: v })}
        />

        <GlassSwitch
          label="Haptic feedback"
          sublabel="Spring compression & choreographed vibration"
          checked={settings.hapticsEnabled}
          onChange={(v) => onUpdateSettings({ hapticsEnabled: v })}
        />

        {settings.hapticsEnabled && (
          <LiquidGlass variant="cyan" shape="bevel" className="p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-white/85">Haptic Waveform Studio</span>
              <span className="text-[10px] text-sky-200/75">Tap shape to feel</span>
            </div>
            <div className="grid grid-cols-5 place-items-center gap-2">
              {(
                [
                  { label: 'Tap', kind: 'tap' as HapticKind, shape: 'circle' as const },
                  { label: 'Pulse', kind: 'pulse' as HapticKind, shape: 'square' as const },
                  { label: 'Double', kind: 'double' as HapticKind, shape: 'squircle' as const },
                  { label: 'Rank', kind: 'rankReveal' as HapticKind, shape: 'diamond' as const },
                  { label: 'Win', kind: 'celebrate' as HapticKind, shape: 'bevel' as const },
                ] as const
              ).map((item) => (
                <LiquidGlass
                  key={item.label}
                  as="button"
                  type="button"
                  shape={item.shape}
                  variant="primary"
                  haptic={item.kind}
                  onClick={() => triggerHaptic(item.kind, settings.hapticsEnabled)}
                  className="h-12 w-12"
                >
                  <span className="flex h-full items-center justify-center text-[10px] font-bold text-white">
                    {item.label}
                  </span>
                </LiquidGlass>
              ))}
            </div>
          </LiquidGlass>
        )}

        <GlassSwitch
          label="Timer sound chimes"
          checked={settings.soundEnabled}
          onChange={(v) => onUpdateSettings({ soundEnabled: v })}
        />

        <LiquidGlass variant="primary" shape="squircle" className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Daily Step Goal</p>
              <p className="text-xs text-white/65">Counts as checklist item for rank</p>
            </div>
            <input
              type="number"
              step={500}
              min={1000}
              max={50000}
              value={settings.stepGoal}
              onChange={(e) => onUpdateSettings({ stepGoal: Number(e.target.value) || 10000 })}
              className="w-24 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-right text-sm font-bold text-white tabular-nums focus:outline-none"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <span className="text-sm font-semibold text-white">Weight Units</span>
            <div className="flex gap-1.5">
              {(['kg', 'lbs'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => onUpdateSettings({ units: u })}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold uppercase ${
                    settings.units === u
                      ? 'bg-white text-[#111318]'
                      : 'bg-white/10 text-white/75'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </LiquidGlass>
      </div>

      {/* Notifications Section (Core 8 + Bubbly Celebrations) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className={`text-base font-bold tracking-tight lowercase ${
              settings.darkSurface ? 'text-white' : 'text-[#111318]'
            }`}
          >
            notifications & bubbly alerts
          </h2>
          <button
            type="button"
            onClick={requestWebNotificationPerm}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
              settings.darkSurface
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-black/10 text-[#111318] hover:bg-black/15'
            }`}
          >
            <Bell className="h-3 w-3" />
            Test Bubbly
          </button>
        </div>

        <GlassSwitch
          label="Bubbly in-app popups"
          sublabel="Celebrates every set, step, timer & save"
          checked={notif.bubblyPopups}
          onChange={(v) => updateNotif({ bubblyPopups: v })}
        />
        <GlassSwitch
          label="Hydration & breath nudges"
          sublabel="Cheerful water reminders between sets"
          checked={notif.hydrationNudge}
          onChange={(v) => updateNotif({ hydrationNudge: v })}
        />
        <GlassSwitch
          label="PR & milestone sparkles"
          sublabel="Instant hype when lifting heavier"
          checked={notif.prCelebration}
          onChange={(v) => updateNotif({ prCelebration: v })}
        />
        <GlassSwitch
          label="Mid-day stretch check-in"
          sublabel="Posture & mobility pulse"
          checked={notif.stretchCheckIn}
          onChange={(v) => updateNotif({ stretchCheckIn: v })}
        />
        <GlassSwitch
          label="Session start hype boost"
          sublabel="Energizing ping when starting 2hr / 1hr blocks"
          checked={notif.sessionBoost}
          onChange={(v) => updateNotif({ sessionBoost: v })}
        />

        <GlassSwitch
          label="Daily workout reminder"
          sublabel={`Scheduled at ${notif.dailyWorkoutTime}`}
          checked={notif.dailyWorkout}
          onChange={(v) => updateNotif({ dailyWorkout: v })}
        />

        {notif.dailyWorkout && (
          <LiquidGlass variant="cyan" shape="pill" className="px-5 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/80">Workout reminder time</span>
              <input
                type="time"
                value={notif.dailyWorkoutTime}
                onChange={(e) => updateNotif({ dailyWorkoutTime: e.target.value })}
                className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white focus:outline-none"
              />
            </div>
          </LiquidGlass>
        )}

        <GlassSwitch
          label="2-Hour Workout Session Reminder"
          sublabel={`Bubbly ping every ${notif.twoHourSessionIntervalMin} min`}
          checked={notif.twoHourSessionReminder}
          onChange={(v) => updateNotif({ twoHourSessionReminder: v })}
        />

        {notif.twoHourSessionReminder && (
          <LiquidGlass variant="primary" shape="bevel" className="p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white/80">2-Hr Session Interval</span>
              <span className="text-[11px] font-bold text-purple-200 tabular-nums">
                {notif.twoHourSessionIntervalMin}m
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[30, 45, 60, 90, 120].map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection', settings.hapticsEnabled);
                    updateNotif({ twoHourSessionIntervalMin: min });
                  }}
                  className={`h-9 min-w-[44px] rounded-[12px] px-2.5 text-xs font-bold tabular-nums transition active:scale-95 ${
                    notif.twoHourSessionIntervalMin === min
                      ? 'bg-white text-[#111318] shadow-sm'
                      : 'bg-white/10 text-white/75 hover:bg-white/20'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </LiquidGlass>
        )}

        <GlassSwitch
          label="1-Hour Workout Session Reminder"
          sublabel={`Bubbly ping every ${notif.oneHourSessionIntervalMin} min`}
          checked={notif.oneHourSessionReminder}
          onChange={(v) => updateNotif({ oneHourSessionReminder: v })}
        />

        {notif.oneHourSessionReminder && (
          <LiquidGlass variant="secondary" shape="bevel" className="p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white/80">1-Hr Session Interval</span>
              <span className="text-[11px] font-bold text-amber-200 tabular-nums">
                {notif.oneHourSessionIntervalMin}m
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[15, 30, 45, 60].map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection', settings.hapticsEnabled);
                    updateNotif({ oneHourSessionIntervalMin: min });
                  }}
                  className={`h-9 min-w-[44px] rounded-full px-3 text-xs font-bold tabular-nums transition active:scale-95 ${
                    notif.oneHourSessionIntervalMin === min
                      ? 'bg-white text-[#111318] shadow-sm'
                      : 'bg-white/10 text-white/75 hover:bg-white/20'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </LiquidGlass>
        )}

        <GlassSwitch
          label="Warm-up reminder"
          sublabel="15 min before daily workout"
          checked={notif.warmupReminder}
          onChange={(v) => updateNotif({ warmupReminder: v })}
        />
        <GlassSwitch
          label="Rest / timer finished alert"
          checked={notif.restTimerAlert}
          onChange={(v) => updateNotif({ restTimerAlert: v })}
        />
        <GlassSwitch
          label="Missed workout reminder"
          sublabel="Evening nudge if session incomplete"
          checked={notif.missedWorkoutEvening}
          onChange={(v) => updateNotif({ missedWorkoutEvening: v })}
        />
        <GlassSwitch
          label="Evening height / posture routine"
          checked={notif.eveningPosture}
          onChange={(v) => updateNotif({ eveningPosture: v })}
        />
        <GlassSwitch
          label="Sleep reminder (8–9 hrs)"
          checked={notif.sleepReminder}
          onChange={(v) => updateNotif({ sleepReminder: v })}
        />
        <GlassSwitch
          label="Step goal reminders"
          sublabel="Midday + evening if under 10,000"
          checked={notif.stepGoalReminders}
          onChange={(v) => updateNotif({ stepGoalReminders: v })}
        />
        <GlassSwitch
          label="Rank result notification at night"
          checked={notif.nightRankResult}
          onChange={(v) => updateNotif({ nightRankResult: v })}
        />
      </div>

      {/* Stored Notification Feed */}
      <LiquidGlass variant="primary" shape="card" className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white/75">
            Stored Notification Log ({notificationHistory.length})
          </span>
          <span className="text-[10px] text-white/50">Offline saved</span>
        </div>
        {notificationHistory.length === 0 ? (
          <p className="text-xs text-white/55">Actions you take appear here automatically.</p>
        ) : (
          <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
            {notificationHistory.slice(0, 8).map((n) => (
              <div key={n.id} className="rounded-xl bg-white/6 px-3 py-2 text-xs">
                <p className="font-semibold text-white">{n.title}</p>
                <p className="text-[11px] text-white/65">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </LiquidGlass>

      {/* Utility Actions */}
      <div className="space-y-3 pt-2">
        <GlassButton
          label="Export Offline Data Backup"
          variant="goldGreen"
          fullWidth
          rightSlot={<Download className="h-4 w-4" />}
          onClick={handleDownloadBackup}
        />
        <GlassButton label="Edit Weekly Plan" variant="cyan" fullWidth onClick={onOpenPlanEditor} />
        <GlassButton
          label="View Liquid Glass Showcase"
          variant="primary"
          fullWidth
          rightSlot={<Sparkles className="h-4 w-4" />}
          onClick={onOpenShowcase}
        />
        <GlassButton
          label="Lock QINXVI Session"
          variant="secondary"
          fullWidth
          rightSlot={<Lock className="h-4 w-4" />}
          onClick={onLockApp}
        />
      </div>
    </div>
  );
};
