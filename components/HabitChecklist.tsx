'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSprintStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { HabitEntry } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { ChevronDown } from 'lucide-react';

export default function HabitChecklist({ habits }: { habits: HabitEntry[] }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const toggleHabit = useSprintStore(state => state.toggleHabit);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <CardTitle className="text-lg">Today's Habits</CardTitle>
                <motion.div animate={{ rotate: isExpanded ? 0 : -90 }}>
                    <ChevronDown className="h-5 w-5 text-muted" />
                </motion.div>
            </CardHeader>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.24, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <CardContent>
                            <div className="space-y-3">
                                {habits.map(habit => (
                                    <motion.div 
                                        key={habit.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center space-x-3"
                                    >
                                        <Checkbox
                                            id={habit.id}
                                            checked={habit.completed}
                                            onCheckedChange={() => toggleHabit(habit.habitId)}
                                        />
                                        <label
                                            htmlFor={habit.id}
                                            className={`flex-1 text-sm ${habit.completed ? 'text-muted line-through' : ''}`}
                                        >
                                            {habit.title}
                                        </label>
                                        {habit.streak > 0 && (
                                            <span className="text-xs font-bold text-accent">🔥 {habit.streak}</span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </motion.section>
                )}
            </AnimatePresence>
        </Card>
    );
}
'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSprintStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { HabitEntry } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { ChevronDown } from 'lucide-react';

export default function HabitChecklist({ habits }: { habits: HabitEntry[] }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const toggleHabit = useSprintStore(state => state.toggleHabit);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <CardTitle className="text-lg">Today's Habits</CardTitle>
                <motion.div animate={{ rotate: isExpanded ? 0 : -90 }}>
                    <ChevronDown className="h-5 w-5 text-muted" />
                </motion.div>
            </CardHeader>
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.24, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <CardContent>
                            <div className="space-y-3">
                                {habits.map(habit => (
                                    <motion.div 
                                        key={habit.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center space-x-3"
                                    >
                                        <Checkbox
                                            id={habit.id}
                                            checked={habit.completed}
                                            onCheckedChange={() => toggleHabit(habit.habitId)}
                                        />
                                        <label
                                            htmlFor={habit.id}
                                            className={`flex-1 text-sm ${habit.completed ? 'text-muted line-through' : ''}`}
                                        >
                                            {habit.title}
                                        </label>
                                        {habit.streak > 0 && (
                                            <span className="text-xs font-bold text-accent">🔥 {habit.streak}</span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </motion.section>
                )}
            </AnimatePresence>
        </Card>
    );
}
