import { db, Player } from '../db'
import { RecordNotFoundError } from './errors'

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

  return result
}
