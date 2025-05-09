import { db, Event, Player } from '../../db'
import eventGet from '../event/event-get'
import playerValidate from './player-validate'

export type PlayerCreateInput = Pick<Player, 'name' | 'paid' | 'dropped'>

export default async function playerCreate(event: Event | string, input: PlayerCreateInput) {
  return await db.transaction('rw', db.events, db.players, async () => {
    if (typeof event === 'string') {
      event = await eventGet(event)
    }

    const result: Player = {
      ...input,
      id: crypto.randomUUID(),
      eventId: event.id,
      wins: 0,
      losses: 0,
      draws: 0,
      score: 0,
      opponentWinRate: 0,
    }

    await playerValidate(result)
    await db.players.add(result)
    await db.events.update(event.id, {
      ...event,
      playersCount: event.playersCount + 1,
    })

    return result
  })
}
