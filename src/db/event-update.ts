import { db, Event } from '../db'
import { RecordInvalidError, RecordNotFoundError } from './errors'

export type EventUpdateInput = Partial<Pick<Event, 'name'>>

export default async function eventUpdate(id: string, event: EventUpdateInput) {
  const existingEvent = await db.events.get(id)

  if (!existingEvent) {
    throw new RecordNotFoundError('Event', id)
  }

  const result: Event = {
    ...existingEvent,
    ...event
  }

  if (!(await isEventNameUnique(id, result.name))) {
    throw new RecordInvalidError(`Event already exists with name '${result.name}'`)
  }

  await db.events.update(id, result)

  return result
}

async function isEventNameUnique(id: string, name: string) {
  const event = await db.events.get({ name })

  return !event || event.id === id
}
