import { Timer } from '../../db'
import timerGet from './timer-get'

export default async function timerTimeRemaining(timer: Timer | string, at: Date = new Date()) {
  if (typeof timer === 'string') {
    timer = await timerGet(timer)
  }

  const timeRemaining = timer.expiresAt.getTime() - (timer.pausedAt ?? at).getTime()

  return timeRemaining > 0 ? timeRemaining : 0
}
