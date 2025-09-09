'use client'
import React, { useEffect } from 'react';
import { useSprintStore } from '@/lib/store';
import { AnimatePresence } from 'framer-motion';

import ProgressClock from './ProgressClock';
import FocusCard from './FocusCard';
import XPBar from './XPBar';
import HabitChecklist from './HabitChecklist';
import TaskList from './TaskList';
import LevelUpModal from './LevelUpModal';
import XpGainNotifier from './XpGainNotifier';
import KeyboardShortcuts from './KeyboardShortcuts';

export default function Dashboard({ initialData }: any) {
  const { sprint, today, loadInitialData, isInitialized } = useSprintStore();

  useEffect(() => {
    if (!isInitialized) {
      loadInitialData(initialData);
    }
  }, [initialData, loadInitialData, isInitialized]);

  if (!isInitialized || !sprint || !today) {
    return <div className="flex items-center justify-center h-screen"><div className="text-muted">Loading sprint...</div></div>;
  }

  return (
    <>
      <KeyboardShortcuts />
      <XpGainNotifier />
      <LevelUpModal />

      <div className="grid grid-cols-1 gap-4">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">Day {today.dayIndex + 1}</h1>
            <p className="text-muted">{sprint.name}</p>
          </div>
          <ProgressClock />
        </header>

        <XPBar />
        
        {today.focusMission && <FocusCard mission={today.focusMission} />}
        
        <HabitChecklist habits={today.habits} />
        
        <TaskList tasks={today.tasks} />
      </div>
    </>
  );
}
'use client'
import React, { useEffect } from 'react';
import { useSprintStore } from '@/lib/store';
import { AnimatePresence } from 'framer-motion';

import ProgressClock from './ProgressClock';
import FocusCard from './FocusCard';
import XPBar from './XPBar';
import HabitChecklist from './HabitChecklist';
import TaskList from './TaskList';
import LevelUpModal from './LevelUpModal';
import XpGainNotifier from './XpGainNotifier';
import KeyboardShortcuts from './KeyboardShortcuts';

export default function Dashboard({ initialData }) {
  const { sprint, today, loadInitialData, isInitialized } = useSprintStore();

  useEffect(() => {
    if (!isInitialized) {
      loadInitialData(initialData);
    }
  }, [initialData, loadInitialData, isInitialized]);

  if (!isInitialized || !sprint || !today) {
    return <div className="flex items-center justify-center h-screen"><div className="text-muted">Loading sprint...</div></div>;
  }

  return (
    <>
      <KeyboardShortcuts />
      <XpGainNotifier />
      <LevelUpModal />

      <div className="grid grid-cols-1 gap-4">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">Day {today.dayIndex + 1}</h1>
            <p className="text-muted">{sprint.name}</p>
          </div>
          <ProgressClock />
        </header>

        <XPBar />
        
        {today.focusMission && <FocusCard mission={today.focusMission} />}
        
        <HabitChecklist habits={today.habits} />
        
        <TaskList tasks={today.tasks} />
      </div>
    </>
  );
}
