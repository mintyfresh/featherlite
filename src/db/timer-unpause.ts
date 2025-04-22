import { db, Timer } from '../db'
import timerGet from './timer-get'

export default async function timerUnpause(timer: Timer | string, at: Date = new Date()) {
  if (typeof timer === 'string') {
    timer = await timerGet(timer)
  }

  if (!timer.pausedAt) {
    return timer // Can't unpause an unpaused timer
  }

  // Calculate the new expiry date based on the amount of time the timer was paused
  const expiresAt = new Date(timer.expiresAt.getTime() + (at.getTime() - timer.pausedAt.getTime()))

  const result: Timer = {
    ...timer,
    expiresAt,
    pausedAt: null,
    updatedAt: new Date(),
  }

  await db.timers.update(timer.id, result)

  return result
}
