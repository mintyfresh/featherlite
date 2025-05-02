import { db, Event } from '../../db'

export default async function roundList(event: Event | string) {
  const eventId = typeof event === 'string' ? event : event.id

  return (await db.rounds.where({ eventId }).sortBy('number')).reverse()
}
