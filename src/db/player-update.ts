import { db, Player } from '../db'
import { RecordNotFoundError } from './errors'
import eventTouch from './event-touch'

export type PlayerUpdateInput = Partial<Pick<Player, 'name' | 'paid' | 'dropped'>>

export default async function playerUpdate(id: string, player: PlayerUpdateInput) {
  const existingPlayer = await db.players.get(id)

  if (!existingPlayer) {
    throw new RecordNotFoundError('Player', id)
  }

  const result: Player = {
    ...existingPlayer,
    ...player,
  }

  await db.players.update(id, result)
  await eventTouch(existingPlayer.eventId)

  return result
}
