'use client';

import { useSprintStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';

export default function XpGainNotifier() {
    const lastXpGain = useSprintStore((state) => state.lastXpGain);

    return (
        <div
            className="fixed top-5 right-5 z-50 pointer-events-none"
            aria-live="polite"
            aria-atomic="true"
        >
            <AnimatePresence>
                {lastXpGain.amount > 0 && (
                    <motion.div
                        key={lastXpGain.id}
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5, transition: { duration: 0.3 } }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="px-4 py-2 bg-accent text-accent-foreground rounded-lg shadow-lg font-bold"
                    >
                        +{lastXpGain.amount} XP
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
'use client';

import { useSprintStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';

export default function XpGainNotifier() {
    const lastXpGain = useSprintStore((state) => state.lastXpGain);

    return (
        <div
            className="fixed top-5 right-5 z-50 pointer-events-none"
            aria-live="polite"
            aria-atomic="true"
        >
            <AnimatePresence>
                {lastXpGain.amount > 0 && (
                    <motion.div
                        key={lastXpGain.id}
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5, transition: { duration: 0.3 } }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="px-4 py-2 bg-accent text-accent-foreground rounded-lg shadow-lg font-bold"
                    >
                        +{lastXpGain.amount} XP
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
