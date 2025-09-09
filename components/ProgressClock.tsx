'use client';
import { useSprintStore } from '@/lib/store';
import { motion } from 'framer-motion';

export default function ProgressClock() {
    const { sprint, today } = useSprintStore();
    if (!sprint || !today) return null;

    const daysLeft = sprint.lengthDays - (today.dayIndex + 1);
    const progress = (today.dayIndex + 1) / sprint.lengthDays;

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center w-24 h-24">
            <svg className="absolute w-full h-full" viewBox="0 0 70 70">
                <circle
                    className="text-border"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="35"
                    cy="35"
                />
                <motion.circle
                    className="text-accent"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="35"
                    cy="35"
                    transform="rotate(-90 35 35)"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'circOut' }}
                />
            </svg>
            <div className="text-center">
                <div className="text-2xl font-bold tabular-nums">{daysLeft}</div>
                <div className="text-xs text-muted uppercase tracking-wider">Days Left</div>
            </div>
        </div>
    );
}
'use client';
import { useSprintStore } from '@/lib/store';
import { motion } from 'framer-motion';

export default function ProgressClock() {
    const { sprint, today } = useSprintStore();
    if (!sprint || !today) return null;

    const daysLeft = sprint.lengthDays - (today.dayIndex + 1);
    const progress = (today.dayIndex + 1) / sprint.lengthDays;

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center w-24 h-24">
            <svg className="absolute w-full h-full" viewBox="0 0 70 70">
                <circle
                    className="text-border"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="35"
                    cy="35"
                />
                <motion.circle
                    className="text-accent"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="35"
                    cy="35"
                    transform="rotate(-90 35 35)"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'circOut' }}
                />
            </svg>
            <div className="text-center">
                <div className="text-2xl font-bold tabular-nums">{daysLeft}</div>
                <div className="text-xs text-muted uppercase tracking-wider">Days Left</div>
            </div>
        </div>
    );
}
