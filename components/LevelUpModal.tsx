'use client'
import { useSprintStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion } from 'framer-motion';

export default function LevelUpModal() {
    const { levelUpInfo, clearLevelUp } = useSprintStore();

    return (
        <Dialog open={!!levelUpInfo.level} onOpenChange={(open) => !open && clearLevelUp()}>
            <DialogContent>
                <DialogHeader>
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.2 }}
                    >
                        <DialogTitle className="text-center text-2xl text-accent">LEVEL UP!</DialogTitle>
                    </motion.div>
                    <DialogDescription className="text-center text-5xl font-bold pt-4">
                       Level {levelUpInfo.level}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
'use client'
import { useSprintStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion } from 'framer-motion';

export default function LevelUpModal() {
    const { levelUpInfo, clearLevelUp } = useSprintStore();

    return (
        <Dialog open={!!levelUpInfo.level} onOpenChange={(open) => !open && clearLevelUp()}>
            <DialogContent>
                <DialogHeader>
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.2 }}
                    >
                        <DialogTitle className="text-center text-2xl text-accent">LEVEL UP!</DialogTitle>
                    </motion.div>
                    <DialogDescription className="text-center text-5xl font-bold pt-4">
                       Level {levelUpInfo.level}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
