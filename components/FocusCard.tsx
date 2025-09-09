'use client'
import { motion } from 'framer-motion'
import { useSprintStore } from '@/lib/store'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { DayRecord } from '@/lib/types'

export default function FocusCard({ mission }: { mission: DayRecord['focusMission'] }) {
  const completeFocusMission = useSprintStore(state => state.completeFocusMission);

  function handleComplete() {
    if (mission?.completed) return;
    completeFocusMission();
  }
  
  if (!mission) return null;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
      <Card className="bg-card border-accent/50">
        <CardHeader>
          <CardTitle className="text-accent text-lg">Focus Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-bold mb-2">{mission.title}</h3>
          {mission.why && <p className="text-sm text-muted mb-4">{mission.why}</p>}
          <Button 
            onClick={handleComplete} 
            disabled={mission.completed}
            variant={mission.completed ? 'secondary' : 'default'}
            className="w-full sm:w-auto"
          >
            {mission.completed ? 'Completed' : 'Mark as Done'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
'use client'
import { motion } from 'framer-motion'
import { useSprintStore } from '@/lib/store'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { DayRecord } from '@/lib/types'

export default function FocusCard({ mission }: { mission: DayRecord['focusMission'] }) {
  const completeFocusMission = useSprintStore(state => state.completeFocusMission);

  function handleComplete() {
    if (mission?.completed) return;
    completeFocusMission();
  }
  
  if (!mission) return null;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
      <Card className="bg-card border-accent/50">
        <CardHeader>
          <CardTitle className="text-accent text-lg">Focus Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-bold mb-2">{mission.title}</h3>
          {mission.why && <p className="text-sm text-muted mb-4">{mission.why}</p>}
          <Button 
            onClick={handleComplete} 
            disabled={mission.completed}
            variant={mission.completed ? 'secondary' : 'default'}
            className="w-full sm:w-auto"
          >
            {mission.completed ? 'Completed' : 'Mark as Done'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
