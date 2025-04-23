import { db, Event } from '../../db'
import eventValidate from './event-validate'

export type EventCreateInput = Pick<Event, 'name'>

export default async function eventCreate(event: EventCreateInput) {
  const now = new Date()

  const result: Event = {
    id: crypto.randomUUID(),
    name: event.name,
    currentRound: null,
    playersCount: 0,
    createdAt: now,
    updatedAt: now,
  }

  await eventValidate(result)
  await db.events.add(result)

  return result
}
