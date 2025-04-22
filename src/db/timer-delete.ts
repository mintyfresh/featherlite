import { db, Timer } from '../db'
import timerGet from './timer-get'

export default async function timerDelete(timer: Timer | string) {
  return await db.transaction('rw', db.timerPhases, db.timers, async () => {
    if (typeof timer === 'string') {
      timer = await timerGet(timer)
    }

    await db.timerPhases.where('timerId').equals(timer.id).delete()
    await db.timers.delete(timer.id)
  })
}
