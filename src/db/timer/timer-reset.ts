import { db, Timer } from '../../db'
import timerGet from './timer-get'

export default async function timerReset(timer: Timer | string) {
  if (typeof timer === 'string') {
    timer = await timerGet(timer)
  }

  const result: Timer = {
    ...timer,
    expiresAt: new Date(Date.now() + timer.duration),
    pausedAt: null,
  }

  await db.timers.update(timer.id, result)

  return result
}
