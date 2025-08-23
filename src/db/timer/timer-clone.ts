import { db, Timer } from '../../db'
import matchGet from '../match/match-get'
import timerGet from './timer-get'

export interface TimerCloneInput {
  matchId: string | null
  offset: number
}

export default async function timerClone(timer: Timer | string, input: TimerCloneInput) {
  return await db.transaction('rw', db.timerPhases, db.timers, db.matches, async () => {
    if (typeof timer === 'string') {
      timer = await timerGet(timer)
    }

    let label = timer.label

    if (input.matchId) {
      const match = await matchGet(input.matchId)
      label = `Table ${match.table}`
    }

    const newTimer: Timer = {
      ...timer,
      id: crypto.randomUUID(),
      matchId: input.matchId ?? null,
      label,
      expiresAt: new Date(timer.expiresAt.getTime() + input.offset),
      createdAt: new Date(),
    }

    await db.timers.add(newTimer)

    const phases = await db.timerPhases.where('timerId').equals(timer.id).sortBy('position')
    const newPhases = phases.map((phase) => ({
      ...phase,
      id: crypto.randomUUID(),
      timerId: newTimer.id,
    }))

    await db.timerPhases.bulkAdd(newPhases)

    return newTimer
  })
}
