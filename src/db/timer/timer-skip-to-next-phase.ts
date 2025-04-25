import { db, Timer } from '../../db'
import timerGet from './timer-get'
import timerTimeRemainingInCurrentPhase from './timer-time-remaining-in-current-phase'

export default async function timerSkipToNextPhase(timer: Timer | string) {
  if (typeof timer === 'string') {
    timer = await timerGet(timer)
  }

  if (timer.pausedAt || timer.expiresAt.getTime() < Date.now()) {
    return timer // Can't skip a timer that has expired or is paused
  }

  const timeRemainingInPhase = await timerTimeRemainingInCurrentPhase(timer)
  const expiresAt = new Date(timer.expiresAt.getTime() - timeRemainingInPhase)

  const result: Timer = {
    ...timer,
    expiresAt,
  }

  await db.timers.update(timer.id, result)

  return result
}
