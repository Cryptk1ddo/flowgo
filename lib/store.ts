import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SprintData, DayRecord } from './types';
import { getCurrentDayIndex } from './sprint';
import { calculateLevel, XP_REWARDS, calculateTaskXp, calculateHabitXp } from './gamification';

interface SprintState {
  sprint: SprintData | null;
  today: DayRecord | null;
  totalXp: number;
  currentDayIndex: number;
  isInitialized: boolean;
  levelUpInfo: { level: number | null };
  lastXpGain: { id: number; amount: number };

  loadInitialData: (data: SprintData) => void;
  addXp: (amount: number) => void;
  completeFocusMission: () => void;
  toggleTask: (taskId: string) => void;
  toggleHabit: (habitId: string) => void;
  clearLevelUp: () => void;
}

export const useSprintStore = create<SprintState>()(
  persist(
    (set, get) => ({
      sprint: null,
      today: null,
      totalXp: 0,
      currentDayIndex: 0,
      isInitialized: false,
      levelUpInfo: { level: null },
      lastXpGain: { id: 0, amount: 0 },

      loadInitialData: (data) => {
        const dayIndex = getCurrentDayIndex(data.config);
        set({
          sprint: data,
          totalXp: data.totalXp,
          currentDayIndex: dayIndex,
          today: data.days[dayIndex],
          isInitialized: true,
        });
      },

      addXp: (amount) => {
        const currentXp = get().totalXp;
        const newXp = currentXp + amount;
        
        const oldLevel = calculateLevel(currentXp).level;
        const newLevel = calculateLevel(newXp).level;

        set({ 
            totalXp: newXp,
            lastXpGain: { id: Date.now(), amount: amount }
        });

        if (newLevel > oldLevel) {
            set({ levelUpInfo: { level: newLevel } });
        }

        // Persist totalXp back to the main sprint object for consistency
        const sprint = get().sprint;
        if(sprint) {
            set({ sprint: { ...sprint, totalXp: newXp }});
        }
      },
      
      clearLevelUp: () => set({ levelUpInfo: { level: null } }),

      completeFocusMission: () => {
        const today = get().today;
        if (today?.focusMission && !today.focusMission.completed) {
          get().addXp(XP_REWARDS.FOCUS_MISSION);
          set(state => ({
            today: {
              ...state.today!,
              focusMission: { ...state.today!.focusMission!, completed: true },
            }
          }));
        }
      },

      toggleTask: (taskId) => {
        const today = get().today;
        const task = today?.tasks.find(t => t.id === taskId);
        if (today && task) {
          const xp = calculateTaskXp(task);
          if (!task.completed) {
            get().addXp(xp);
          } else {
            get().addXp(-xp); // remove XP if un-checking
          }
          set(state => ({
            today: {
              ...state.today!,
              tasks: state.today!.tasks.map(t => t.id === taskId ? {...t, completed: !t.completed} : t)
            }
          }));
        }
      },
      
      toggleHabit: (habitId) => {
        const { sprint, today } = get();
        const habitEntry = today?.habits.find(h => h.habitId === habitId);
        const habitDef = sprint?.habits.find(h => h.id === habitId);
        if (today && habitEntry && habitDef) {
          const xp = calculateHabitXp(habitDef);
          if (!habitEntry.completed) {
            get().addXp(xp);
          } else {
            get().addXp(-xp);
          }
           set(state => ({
            today: {
              ...state.today!,
              habits: state.today!.habits.map(h => h.habitId === habitId ? {...h, completed: !h.completed} : h)
            }
          }));
        }
      },
    }),
    {
      name: 'dfrnt:sprint:v1',
      storage: createJSONStorage(() => localStorage),
      // Only persist the main sprint data blob
      partialize: (state) => ({ sprint: state.sprint }),
       // On rehydration, re-calculate derived state
      onRehydrateStorage: () => (state, error) => {
        if (state && state.sprint) {
          state.loadInitialData(state.sprint);
        }
      }
    }
  )
);
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SprintData, DayRecord } from './types';
import { getCurrentDayIndex } from './sprint';
import { calculateLevel, XP_REWARDS, calculateTaskXp, calculateHabitXp } from './gamification';

interface SprintState {
  sprint: SprintData | null;
  today: DayRecord | null;
  totalXp: number;
  currentDayIndex: number;
  isInitialized: boolean;
  levelUpInfo: { level: number | null };
  lastXpGain: { id: number; amount: number };

  loadInitialData: (data: SprintData) => void;
  addXp: (amount: number) => void;
  completeFocusMission: () => void;
  toggleTask: (taskId: string) => void;
  toggleHabit: (habitId: string) => void;
  clearLevelUp: () => void;
}

export const useSprintStore = create<SprintState>()(
  persist(
    (set, get) => ({
      sprint: null,
      today: null,
      totalXp: 0,
      currentDayIndex: 0,
      isInitialized: false,
      levelUpInfo: { level: null },
      lastXpGain: { id: 0, amount: 0 },

      loadInitialData: (data) => {
        const dayIndex = getCurrentDayIndex(data.config);
        set({
          sprint: data,
          totalXp: data.totalXp,
          currentDayIndex: dayIndex,
          today: data.days[dayIndex],
          isInitialized: true,
        });
      },

      addXp: (amount) => {
        const currentXp = get().totalXp;
        const newXp = currentXp + amount;
        
        const oldLevel = calculateLevel(currentXp).level;
        const newLevel = calculateLevel(newXp).level;

        set({ 
            totalXp: newXp,
            lastXpGain: { id: Date.now(), amount: amount }
        });

        if (newLevel > oldLevel) {
            set({ levelUpInfo: { level: newLevel } });
        }

        const sprint = get().sprint;
        if(sprint) {
            set({ sprint: { ...sprint, totalXp: newXp }});
        }
      },
      
      clearLevelUp: () => set({ levelUpInfo: { level: null } }),

      completeFocusMission: () => {
        const today = get().today;
        if (today?.focusMission && !today.focusMission.completed) {
          get().addXp(XP_REWARDS.FOCUS_MISSION);
          set(state => ({
            today: {
              ...state.today!,
              focusMission: { ...state.today!.focusMission!, completed: true },
            }
          }));
        }
      },

      toggleTask: (taskId) => {
        const today = get().today;
        const task = today?.tasks.find(t => t.id === taskId);
        if (today && task) {
          const xp = calculateTaskXp(task);
          if (!task.completed) {
            get().addXp(xp);
          } else {
            get().addXp(-xp);
          }
          set(state => ({
            today: {
              ...state.today!,
              tasks: state.today!.tasks.map(t => t.id === taskId ? {...t, completed: !t.completed} : t)
            }
          }));
        }
      },
      
      toggleHabit: (habitId) => {
        const { sprint, today } = get();
        const habitEntry = today?.habits.find(h => h.habitId === habitId);
        const habitDef = sprint?.habits.find(h => h.id === habitId);
        if (today && habitEntry && habitDef) {
          const xp = calculateHabitXp(habitDef);
          if (!habitEntry.completed) {
            get().addXp(xp);
          } else {
            get().addXp(-xp);
          }
           set(state => ({
            today: {
              ...state.today!,
              habits: state.today!.habits.map(h => h.habitId === habitId ? {...h, completed: !h.completed} : h)
            }
          }));
        }
      },
    }),
    {
      name: 'dfrnt:sprint:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sprint: state.sprint }),
      onRehydrateStorage: () => (state, error) => {
        if (state && state.sprint) {
          state.loadInitialData(state.sprint);
        }
      }
    }
  )
);
