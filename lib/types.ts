export type UUID = string;

export interface SprintConfig {
  id: UUID;
  startDate: string; // ISO
  lengthDays: number; // default 182
  name: string;
}

export interface DayRecord {
  dayIndex: number; // 0..lengthDays-1
  date: string; // ISO
  focusMission?: {
    id: UUID;
    title: string;
    why?: string;
    completed: boolean;
  };
  tasks: Task[];
  habits: HabitEntry[];
  metrics?: Metrics;
  xpGained: number;
}

export interface Task {
  id: UUID;
  title: string;
  priority: number; // 1 highest - 5 lowest
  completed: boolean;
  estimateMinutes?: number;
  tags?: string[];
}

export interface HabitEntry {
  id: UUID; // Instance ID for this day
  habitId: UUID; // Foreign key to Habit
  title: string;
  completed: boolean;
  streak: number;
}

export interface Habit {
  id: UUID;
  title: string;
  cadence: 'daily'|'every-other'|'weekly';
  xpReward: number;
}

export interface Metrics {
  weightKg?: number;
  sleepHours?: number;
  workoutMinutes?: number;
  notes?: string;
}

// Data structure for the entire sprint
export interface SprintData {
  config: SprintConfig;
  habits: Habit[];
  days: DayRecord[];
  totalXp: number;
}
export type UUID = string;

export interface SprintConfig {
  id: UUID;
  startDate: string; // ISO
  lengthDays: number; // default 182
  name: string;
}

export interface DayRecord {
  dayIndex: number; // 0..lengthDays-1
  date: string; // ISO
  focusMission?: {
    id: UUID;
    title: string;
    why?: string;
    completed: boolean;
  };
  tasks: Task[];
  habits: HabitEntry[];
  metrics?: Metrics;
  xpGained: number;
}

export interface Task {
  id: UUID;
  title: string;
  priority: number; // 1 highest - 5 lowest
  completed: boolean;
  estimateMinutes?: number;
  tags?: string[];
}

export interface HabitEntry {
  id: UUID; // Instance ID for this day
  habitId: UUID; // Foreign key to Habit
  title: string;
  completed: boolean;
  streak: number;
}

export interface Habit {
  id: UUID;
  title: string;
  cadence: 'daily'|'every-other'|'weekly';
  xpReward: number;
}

export interface Metrics {
  weightKg?: number;
  sleepHours?: number;
  workoutMinutes?: number;
  notes?: string;
}

// Data structure for the entire sprint
export interface SprintData {
  config: SprintConfig;
  habits: Habit[];
  days: DayRecord[];
  totalXp: number;
}
