import * as Notifications from 'expo-notifications';
import { AppSettings } from '../types/workout';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const BUBBLY_PREFIXES = [
  'Boom! Task crushed!',
  'Sparkle check!',
  'Momentum unlocked!',
  'Pure discipline!',
  'Keep glowing!',
];

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function triggerBubblyTaskNotification(
  taskName: string,
  detail?: string,
  enabled = true
) {
  if (!enabled) return;
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const opener = BUBBLY_PREFIXES[Math.floor(Math.random() * BUBBLY_PREFIXES.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `QINXVI · ${opener}`,
      body: detail ? `${taskName} — ${detail}` : `${taskName} completed & stored offline!`,
      sound: true,
    },
    trigger: null,
  });
}

export async function scheduleQinxviNotifications(settings: AppSettings) {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  const n = settings.notifications;
  const [hourStr, minStr] = n.dailyWorkoutTime.split(':');
  const hour = Number(hourStr) || 7;
  const minute = Number(minStr) || 0;

  if (n.dailyWorkout) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'QINXVI · Let’s Glow!', body: 'Your 2-hr main session is primed & ready!' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  }

  if (n.warmupReminder) {
    const totalMin = hour * 60 + minute - 15;
    const wuHour = Math.floor(((totalMin + 1440) % 1440) / 60);
    const wuMin = (totalMin + 1440) % 60;
    await Notifications.scheduleNotificationAsync({
      content: { title: 'QINXVI · Warm-Up Spark!', body: '10-min mobility flow starts in 15 minutes!' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: wuHour, minute: wuMin },
    });
  }

  // Custom interval repeating reminder for the 2-Hour Main Workout Session
  if (n.twoHourSessionReminder && n.twoHourSessionIntervalMin >= 1) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'QINXVI · 2-Hour Main Session Pulse',
        body: `Checking in every ${n.twoHourSessionIntervalMin}m — sip water, stay locked in!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(60, n.twoHourSessionIntervalMin * 60),
        repeats: true,
      },
    });
  }

  // Custom interval repeating reminder for the 1-Hour Secondary Workout Session
  if (n.oneHourSessionReminder && n.oneHourSessionIntervalMin >= 1) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'QINXVI · 1-Hour Bonus Session',
        body: `Reminder every ${n.oneHourSessionIntervalMin}m — hit your skill/cardio hour!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(60, n.oneHourSessionIntervalMin * 60),
        repeats: true,
      },
    });
  }

  if (n.missedWorkoutEvening) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'QINXVI · Gentle Hype Check', body: 'Close out remaining checklist items for DEMON rank!' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 19, minute: 30 },
    });
  }

  if (n.eveningPosture) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'QINXVI · Height & Posture Flow', body: '10–15 min decompression & box breathing time!' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
    });
  }

  if (n.sleepReminder) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'QINXVI · Deep Recovery Sleep', body: 'Target 8–9 hours so muscles grow overnight!' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 22, minute: 15 },
    });
  }

  if (n.stepGoalReminders) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'QINXVI · Midday Step Boost!', body: 'Quick walk check — keep that 10,000 ring spinning!' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 13, minute: 0 },
    });
    await Notifications.scheduleNotificationAsync({
      content: { title: 'QINXVI · Evening Step Sprint!', body: 'Finish your 10k target before tonight’s rank reveal!' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
    });
  }

  if (n.nightRankResult) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'QINXVI · Daily Rank Ready!', body: 'Tap to reveal DEMON, BEAST, or LOSER!' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 22, minute: 0 },
    });
  }
}

export async function triggerTimerFinishedNotification(exerciseName: string) {
  await triggerBubblyTaskNotification(`${exerciseName} timer done`, 'Shake it out & crush the next set!');
}
