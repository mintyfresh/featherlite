import { db, Event } from '../../db'
import eventGet from './event-get'
import eventValidate from './event-validate'

export type EventUpdateInput = Partial<Pick<Event, 'name'>>

export default async function eventUpdate(event: Event | string, input: EventUpdateInput) {
  if (typeof event === 'string') {
    event = await eventGet(event)
  }

  const result: Event = {
    ...event,
    ...input,
    updatedAt: new Date(),
  }

  await eventValidate(result)
  await db.events.update(event.id, result)

  return result
}
