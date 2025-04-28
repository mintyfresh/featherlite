import { db, Event } from '../../db'
import eventValidate from './event-validate'

export type EventCreateInput = Pick<Event, 'name'>

export default async function eventCreate(event: EventCreateInput) {
  const result: Event = {
    id: crypto.randomUUID(),
    name: event.name,
    currentRound: null,
    playersCount: 0,
    createdAt: new Date(),
    deletedAt: null,
  }

  await eventValidate(result)
  await db.events.add(result)

  return result
}
