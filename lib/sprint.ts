import { differenceInDays, addDays, formatISO } from 'date-fns';
import { SprintData, SprintConfig, DayRecord, Habit } from './types';
import seedData from '../data/seed.json';

// In a real app, this would fetch from localStorage or an API
export function getSprintData(): SprintData {
    // For this example, we always return the seed data.
    // A real implementation would look like this:
    /*
    try {
        const storedData = localStorage.getItem('dfrnt:sprint:v1');
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Failed to load from localStorage", error);
    }
    */
    return seedData as SprintData;
}

export function getCurrentDayIndex(config: SprintConfig): number {
    const now = new Date();
    const startDate = new Date(config.startDate);
    const index = differenceInDays(now, startDate);
    return Math.max(0, Math.min(index, config.lengthDays - 1));
}

export function createNewDayRecord(dayIndex: number, config: SprintConfig, habits: Habit[]): DayRecord {
    const date = addDays(new Date(config.startDate), dayIndex);
    return {
        dayIndex,
        date: formatISO(date),
        tasks: [], // tasks would be added separately
        habits: habits.map(h => ({
            id: crypto.randomUUID(),
            habitId: h.id,
            title: h.title,
            completed: false,
            streak: 0, // Streak calculation needs historical data
        })),
        xpGained: 0,
    };
}
import { differenceInDays, addDays, formatISO } from 'date-fns';
import { SprintData, SprintConfig, DayRecord, Habit } from './types';
import seedData from '../data/seed.json';

// In a real app, this would fetch from localStorage or an API
export function getSprintData(): SprintData {
    // For this example, we always return the seed data.
    return seedData as SprintData;
}

export function getCurrentDayIndex(config: SprintConfig): number {
    const now = new Date();
    const startDate = new Date(config.startDate);
    const index = differenceInDays(now, startDate);
    return Math.max(0, Math.min(index, config.lengthDays - 1));
}

export function createNewDayRecord(dayIndex: number, config: SprintConfig, habits: Habit[]): DayRecord {
    const date = addDays(new Date(config.startDate), dayIndex);
    return {
        dayIndex,
        date: formatISO(date),
        tasks: [], // tasks would be added separately
        habits: habits.map(h => ({
            id: crypto.randomUUID(),
            habitId: h.id,
            title: h.title,
            completed: false,
            streak: 0, // Streak calculation needs historical data
        })),
        xpGained: 0,
    };
}
