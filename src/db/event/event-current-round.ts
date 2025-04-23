import { db, Event } from '../../db'
import eventGet from './event-get'

export default async function eventCurrentRound(event: Event | string) {
  if (typeof event === 'string') {
    event = await eventGet(event)
  }

  if (!event.currentRound) {
    return null
  }

  return await db.rounds.get({ eventId: event.id, number: event.currentRound })
}
