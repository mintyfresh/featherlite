import { db, Timer } from '../../db'
import timerGet from './timer-get'

export type TimerUpdateInput = Partial<Pick<Timer, 'label'>>

export default async function timerUpdate(timer: Timer | string, input: TimerUpdateInput) {
  if (typeof timer === 'string') {
    timer = await timerGet(timer)
  }

  const result: Timer = {
    ...timer,
    ...input,
  }

  await db.timers.update(timer.id, result)

  return result
}
