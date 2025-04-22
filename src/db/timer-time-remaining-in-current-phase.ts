import { Timer } from '../db'
import timerCurrentPhase from './timer-current-phase'
import timerGet from './timer-get'
import timerTimeRemaining from './timer-time-remaining'

export default async function timerTimeRemainingInCurrentPhase(timer: Timer | string, at: Date = new Date()) {
  if (typeof timer === 'string') {
    timer = await timerGet(timer)
  }

  const currentPhase = await timerCurrentPhase(timer, at)
  const timeRemaining = await timerTimeRemaining(timer, at)

  return timeRemaining - currentPhase.offsetFromEnd
}
