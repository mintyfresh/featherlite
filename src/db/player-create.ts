import { db, Player } from '../db'
import { RecordNotFoundError } from './errors'

export type PlayerCreateInput = Omit<Player, 'id' | 'eventId'>

export default async function playerCreate(eventId: string, player: PlayerCreateInput) {
  return await db.transaction('rw', db.events, db.players, async () => {
    const event = await db.events.get(eventId)
  
    if (!event) {
      throw new RecordNotFoundError('Event', eventId)
    }
  
    const result: Player = {
      ...player,
      id: crypto.randomUUID(),
      eventId: event.id,
    }

    db.players.add(result)
    db.events.update(eventId, {
      ...event,
      playersCount: event.playersCount + 1,
    })

    return result
  })
}
