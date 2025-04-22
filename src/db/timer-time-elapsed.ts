import { Timer } from '../db'
import timerGet from './timer-get'
import timerTimeRemaining from './timer-time-remaining'

export default async function timerTimeElapsed(timer: Timer | string, at: Date = new Date()) {
  if (typeof timer === 'string') {
    timer = await timerGet(timer)
  }

  return timer.duration - await timerTimeRemaining(timer, at)
}
