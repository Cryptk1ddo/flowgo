import { Task, Habit, DayRecord } from "./types";

export const XP_REWARDS = {
  FOCUS_MISSION: 50,
  BASE_TASK: 10,
  BASE_HABIT: 5,
};

/**
 * Calculates XP for completing a task.
 * @param task The task that was completed.
 * @returns The amount of XP gained.
 */
export function calculateTaskXp(task: Task): number {
    let xp = XP_REWARDS.BASE_TASK;
    if (task.estimateMinutes) {
        xp += Math.ceil(task.estimateMinutes / 15);
    }
    return xp;
}

/**
 * Calculates XP for completing a habit.
 * @param habit The habit definition.
 * @returns The amount of XP gained.
 */
export function calculateHabitXp(habit: Habit): number {
    return habit.xpReward || XP_REWARDS.BASE_HABIT;
}

/**
 * Calculates the user's current level based on total XP.
 * Formula: level = floor((totalXP / 500) ^ 0.6)
 * @param totalXp The user's total experience points.
 * @returns The user's current level and the XP of the last level up.
 */
export function calculateLevel(totalXp: number): { level: number; xpAtLevelUp: number } {
    if (totalXp <= 0) return { level: 0, xpAtLevelUp: 0 };
    const level = Math.floor(Math.pow(totalXp / 500, 0.6));
    const xpForLevel = getXpForNextLevel(level - 1);
    return { level, xpAtLevelUp: xpForLevel };
}

/**
 * Calculates the total XP required to reach the next level.
 * Inverse of the level formula: totalXP = 500 * (level ^ (1/0.6))
 * @param currentLevel The user's current level.
 * @returns The total XP needed to reach the *start* of the next level.
 */
export function getXpForNextLevel(currentLevel: number): number {
    if (currentLevel < 0) return 0;
    const nextLevel = currentLevel + 1;
    return Math.ceil(500 * Math.pow(nextLevel, 1 / 0.6));
}
import { Task, Habit, DayRecord } from "./types";

export const XP_REWARDS = {
  FOCUS_MISSION: 50,
  BASE_TASK: 10,
  BASE_HABIT: 5,
};

export function calculateTaskXp(task: Task): number {
    let xp = XP_REWARDS.BASE_TASK;
    if (task.estimateMinutes) {
        xp += Math.ceil(task.estimateMinutes / 15);
    }
    return xp;
}

export function calculateHabitXp(habit: Habit): number {
    return habit.xpReward || XP_REWARDS.BASE_HABIT;
}

export function calculateLevel(totalXp: number): { level: number; xpAtLevelUp: number } {
    if (totalXp <= 0) return { level: 0, xpAtLevelUp: 0 };
    const level = Math.floor(Math.pow(totalXp / 500, 0.6));
    const xpForLevel = getXpForNextLevel(level - 1);
    return { level, xpAtLevelUp: xpForLevel };
}

export function getXpForNextLevel(currentLevel: number): number {
    if (currentLevel < 0) return 0;
    const nextLevel = currentLevel + 1;
    return Math.ceil(500 * Math.pow(nextLevel, 1 / 0.6));
}
