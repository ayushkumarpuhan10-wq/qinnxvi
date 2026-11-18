import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { INITIAL_WEEK_PLAN } from '../data/program';
import { AppSettings, DailyProgress, DayKey, DayPlan } from '../types/workout';

const KEYS = {
  PLAN: 'qinxvi_plan',
  LOGS: 'qinxvi_logs',
  SETTINGS: 'qinxvi_settings',
};

export const DEFAULT_SETTINGS: AppSettings = {
  requireCodeEveryLaunch: false,
  stepGoal: 10000,
  units: 'kg',
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
    bubblyTaskPush: true,
    twoHourSessionReminder: true,
    twoHourSessionIntervalMin: 120,
    oneHourSessionReminder: true,
    oneHourSessionIntervalMin: 60,
  },
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('qinxvi.db').then(async (db: SQLite.SQLiteDatabase) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS kv_store (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      return db;
    });
  }
  return dbPromise;
}

async function setItem(key: string, value: unknown) {
  const json = JSON.stringify(value);
  await AsyncStorage.setItem(key, json);
  try {
    const db = await getDb();
    await db.runAsync('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', key, json);
  } catch {
    // AsyncStorage acts as immediate fallback
  }
}

async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv_store WHERE key = ?', key);
    if (row?.value) return JSON.parse(row.value) as T;
  } catch {
    // Fallback to AsyncStorage
  }
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

export const QinxviStorage = {
  loadPlan: () => getItem<Record<DayKey, DayPlan>>(KEYS.PLAN, INITIAL_WEEK_PLAN),
  savePlan: (plan: Record<DayKey, DayPlan>) => setItem(KEYS.PLAN, plan),
  loadLogs: () => getItem<Record<string, DailyProgress>>(KEYS.LOGS, {}),
  saveLogs: (logs: Record<string, DailyProgress>) => setItem(KEYS.LOGS, logs),
  loadSettings: () => getItem<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings: AppSettings) => setItem(KEYS.SETTINGS, settings),
};
