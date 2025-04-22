import { db } from '../db'
import { RecordNotFoundError } from './errors'

export default async function timerGet(id: string) {
  const timer = await db.timers.get(id)

  if (!timer) {
    throw new RecordNotFoundError('Timer', id)
  }

  return timer
}
