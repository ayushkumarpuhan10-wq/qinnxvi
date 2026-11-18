import { PriorityLevel, RankTier, TrainingType } from '../theme/tokens';

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type TimerMode = 'rest' | 'countdown' | 'interval';

export interface TimerConfig {
  mode: TimerMode;
  durationSec: number;
  restSec?: number;
  rounds?: number;
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
}

export interface AppSettings {
  requireCodeEveryLaunch: boolean;
  stepGoal: number;
  units: 'kg' | 'lbs';
  notifications: {
    dailyWorkout: boolean;
    dailyWorkoutTime: string;
    warmupReminder: boolean;
    restTimerAlert: boolean;
    missedWorkoutEvening: boolean;
    eveningPosture: boolean;
    sleepReminder: boolean;
    stepGoalReminders: boolean;
    nightRankResult: boolean;
    bubblyTaskPush: boolean;
    twoHourSessionReminder: boolean;
    twoHourSessionIntervalMin: number;
    oneHourSessionReminder: boolean;
    oneHourSessionIntervalMin: number;
  };
}
