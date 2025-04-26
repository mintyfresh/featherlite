import { db, Event } from '../../db'

export default async function eventRounds(event: Event | string) {
  const eventId = typeof event === 'string' ? event : event.id

  return await db.rounds.where('eventId').equals(eventId).sortBy('number')
}
