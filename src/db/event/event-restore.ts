import { db, Event } from '../../db'
import { RecordNotFoundError } from '../errors'

export default async function eventRestore(event: Event | string) {
  const eventId = typeof event === 'string' ? event : event.id

  const count = await db.events.update(eventId, { deletedAt: null })

  if (count === 0) {
    throw new RecordNotFoundError('Event', eventId)
  }

  return true
}
