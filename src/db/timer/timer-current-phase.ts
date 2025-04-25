import { db, Timer } from '../../db'
import timerGet from './timer-get'
import timerTimeElapsed from './timer-time-elapsed'

export default async function timerCurrentPhase(timer: Timer | string, at: Date = new Date()) {
  if (typeof timer === 'string') {
    timer = await timerGet(timer)
  }

  const phases = await db.timerPhases.where('timerId').equals(timer.id).sortBy('position')
  const timeElapsed = await timerTimeElapsed(timer, at)

  for (const phase of phases) {
    const phaseStart = phase.offsetFromStart
    const phaseEnd = phaseStart + phase.duration

    if (timeElapsed >= phaseStart && timeElapsed < phaseEnd) {
      return phase
    }
  }

  return phases[phases.length - 1]
}
