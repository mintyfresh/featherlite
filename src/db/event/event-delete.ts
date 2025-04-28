import { db, Event } from '../../db'
import { RecordNotFoundError } from '../errors'

export default async function eventDelete(event: Event | string) {
  const eventId = typeof event === 'string' ? event : event.id

  const count = await db.events.update(eventId, { deletedAt: new Date() })

  if (count === 0) {
    throw new RecordNotFoundError('Event', eventId)
  }

  return true
}
