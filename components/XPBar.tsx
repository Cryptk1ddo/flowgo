'use client';
import { useSprintStore } from '@/lib/store';
import { calculateLevel, getXpForNextLevel } from '@/lib/gamification';
import { Progress } from './ui/progress';
import { motion } from 'framer-motion';

export default function XPBar() {
    const { totalXp } = useSprintStore();
    
    const levelInfo = calculateLevel(totalXp);
    const xpForNextLevel = getXpForNextLevel(levelInfo.level);
    const xpForCurrentLevel = getXpForNextLevel(levelInfo.level - 1);
    
    const xpInCurrentLevel = totalXp - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    const progressPercentage = (xpInCurrentLevel / xpNeededForLevel) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1 text-sm">
                <div className="font-bold text-accent">Level {levelInfo.level}</div>
                <div className="text-muted tabular-nums">
                    {totalXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                </div>
            </div>
            <Progress value={progressPercentage} />
        </div>
    );
}
'use client';
import { useSprintStore } from '@/lib/store';
import { calculateLevel, getXpForNextLevel } from '@/lib/gamification';
import { Progress } from './ui/progress';
import { motion } from 'framer-motion';

export default function XPBar() {
    const { totalXp } = useSprintStore();
    
    const levelInfo = calculateLevel(totalXp);
    const xpForNextLevel = getXpForNextLevel(levelInfo.level);
    const xpForCurrentLevel = getXpForNextLevel(levelInfo.level - 1);
    
    const xpInCurrentLevel = totalXp - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    const progressPercentage = (xpInCurrentLevel / xpNeededForLevel) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1 text-sm">
                <div className="font-bold text-accent">Level {levelInfo.level}</div>
                <div className="text-muted tabular-nums">
                    {totalXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                </div>
            </div>
            <Progress value={progressPercentage} />
        </div>
    );
}
