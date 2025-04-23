import { db, Event } from '../../db'
import { RecordNotFoundError } from '../errors'

export default async function eventCurrentRound(event: Event | string) {
  if (typeof event === 'string') {
    const result = await db.events.get(event)

    if (!result) {
      throw new RecordNotFoundError('Event', event)
    }

    event = result
  }

  if (!event.currentRound) {
    return null
  }

  return await db.rounds.get({ eventId: event.id, number: event.currentRound })
}
