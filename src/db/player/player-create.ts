import { db, Event, Player } from '../../db'
import eventGet from '../event/event-get'

export type PlayerCreateInput = Omit<Player, 'id' | 'eventId'>

export default async function playerCreate(event: Event | string, input: PlayerCreateInput) {
  return await db.transaction('rw', db.events, db.players, async () => {
    if (typeof event === 'string') {
      event = await eventGet(event)
    }

    const result: Player = {
      ...input,
      id: crypto.randomUUID(),
      eventId: event.id,
    }

    db.players.add(result)
    db.events.update(event.id, {
      ...event,
      playersCount: event.playersCount + 1,
      updatedAt: new Date(),
    })

    return result
  })
}
