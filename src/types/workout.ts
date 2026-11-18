import { PriorityLevel, RankTier, TrainingType } from '../theme/tokens';

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type TimerMode = 'rest' | 'countdown' | 'interval';

export interface TimerConfig {
  mode: TimerMode;
  durationSec: number; // rest duration or countdown duration or work interval
  restSec?: number; // for interval mode
  rounds?: number; // for interval mode
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  type: TrainingType;
  secondaryType?: TrainingType;
  priority: PriorityLevel;
  muscles: string;
  timer: TimerConfig;
  notes?: string;
}

export interface ExtraHourItem {
  id: string;
  title: string;
  durationLabel: string;
  type: TrainingType;
  secondaryType?: TrainingType;
  timer?: TimerConfig;
}

export interface DayPlan {
  day: DayKey;
  fullDay: string;
  title: string;
  mainSessionDuration?: string;
  primaryType: TrainingType;
  secondaryType?: TrainingType;
  isRestDay?: boolean;
  exercises: ExerciseItem[];
  extraHour: ExtraHourItem;
}

export interface SequenceStep {
  id: string;
  name: string;
  durationSec: number;
  cue: string;
  setsLabel?: string;
}

export interface SetLog {
  completed: boolean;
  weight: string;
  repsDone?: string;
}

export interface ExerciseLog {
  completed: boolean;
  sets: SetLog[];
}

export interface DailyProgress {
  dateISO: string;
  dayKey: DayKey;
  exercises: Record<string, ExerciseLog>;
  warmupDone: boolean;
  mainSessionDone?: boolean;
  extraHourDone: boolean;
  postureDone: boolean;
  staminaFinisherDone: boolean;
  steps: number;
  rank?: RankTier;
  missedCount?: number;
  revealedAt?: string;
}

export interface WeightHistoryPoint {
  dateISO: string;
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
}

export interface NotificationSettings {
  dailyWorkout: boolean;
  dailyWorkoutTime: string; // HH:MM
  warmupReminder: boolean;
  restTimerAlert: boolean;
  missedWorkoutEvening: boolean;
  eveningPosture: boolean;
  sleepReminder: boolean;
  stepGoalReminders: boolean;
  nightRankResult: boolean;
  bubblyPopups: boolean;
  hydrationNudge: boolean;
  prCelebration: boolean;
  stretchCheckIn: boolean;
  sessionBoost: boolean;
  twoHourSessionReminder: boolean;
  twoHourSessionIntervalMin: number;
  oneHourSessionReminder: boolean;
  oneHourSessionIntervalMin: number;
}

export interface BubblyNotificationItem {
  id: string;
  title: string;
  message: string;
  tone: 'celebrate' | 'boost' | 'hydration' | 'timer' | 'rank' | 'info';
  createdAt: string;
}

export interface AppSettings {
  requireCodeEveryLaunch: boolean;
  stepGoal: number;
  units: 'kg' | 'lbs';
  darkSurface: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  notifications: NotificationSettings;
}

export interface RankHistoryEntry {
  dateISO: string;
  dayKey: DayKey;
  rank: RankTier;
  missedCount: number;
  completionPct: number;
}
