import { db, Timer } from '../../db'
import timerGet from './timer-get'

export default async function timerPause(timer: Timer | string) {
  if (typeof timer === 'string') {
    timer = await timerGet(timer)
  }

  if (timer.pausedAt || timer.expiresAt.getTime() < Date.now()) {
    return timer // Can't pause an expired timer
  }

  const result: Timer = {
    ...timer,
    pausedAt: new Date(),
  }

  await db.timers.update(timer.id, result)

  return result
}
