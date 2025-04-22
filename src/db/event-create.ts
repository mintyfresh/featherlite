import { db, Event } from '../db'
import { RecordInvalidError } from './errors'

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

  if (await db.events.get({ name: event.name })) {
    throw new RecordInvalidError(`Event already exists with name '${event.name}'`)
  }

  await db.events.add(result)

  return result
}
