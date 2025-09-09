'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSprintStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Task } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_VISIBLE_TASKS = 3;

export default function TaskList({ tasks }: { tasks: Task[] }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const toggleTask = useSprintStore(state => state.toggleTask);
    
    const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority).sort((a,b) => Number(a.completed) - Number(b.completed));
    const visibleTasks = showAll ? sortedTasks : sortedTasks.slice(0, MAX_VISIBLE_TASKS);
    const hasMoreTasks = sortedTasks.length > MAX_VISIBLE_TASKS;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <CardTitle className="text-lg">Today's Tasks</CardTitle>
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
                                {visibleTasks.map(task => (
                                    <motion.div 
                                        key={task.id}
                                        layout="position"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center space-x-3"
                                    >
                                        <Checkbox
                                            id={task.id}
                                            checked={task.completed}
                                            onCheckedChange={() => toggleTask(task.id)}
                                        />
                                        <label
                                            htmlFor={task.id}
                                            className={cn("flex-1 text-sm", task.completed && "text-muted line-through")}
                                        >
                                            {task.title}
                                        </label>
                                    </motion.div>
                                ))}
                            </div>
                            {hasMoreTasks && !showAll && (
                                <Button variant="link" className="p-0 h-auto mt-3 text-accent" onClick={() => setShowAll(true)}>
                                    Show {sortedTasks.length - MAX_VISIBLE_TASKS} more
                                </Button>
                            )}
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
import { Task } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_VISIBLE_TASKS = 3;

export default function TaskList({ tasks }: { tasks: Task[] }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const toggleTask = useSprintStore(state => state.toggleTask);
    
    const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority).sort((a,b) => Number(a.completed) - Number(b.completed));
    const visibleTasks = showAll ? sortedTasks : sortedTasks.slice(0, MAX_VISIBLE_TASKS);
    const hasMoreTasks = sortedTasks.length > MAX_VISIBLE_TASKS;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <CardTitle className="text-lg">Today's Tasks</CardTitle>
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
                                {visibleTasks.map(task => (
                                    <motion.div 
                                        key={task.id}
                                        layout="position"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center space-x-3"
                                    >
                                        <Checkbox
                                            id={task.id}
                                            checked={task.completed}
                                            onCheckedChange={() => toggleTask(task.id)}
                                        />
                                        <label
                                            htmlFor={task.id}
                                            className={cn("flex-1 text-sm", task.completed && "text-muted line-through")}
                                        >
                                            {task.title}
                                        </label>
                                    </motion.div>
                                ))}
                            </div>
                            {hasMoreTasks && !showAll && (
                                <Button variant="link" className="p-0 h-auto mt-3 text-accent" onClick={() => setShowAll(true)}>
                                    Show {sortedTasks.length - MAX_VISIBLE_TASKS} more
                                </Button>
                            )}
                        </CardContent>
                    </motion.section>
                )}
            </AnimatePresence>
        </Card>
    );
}
