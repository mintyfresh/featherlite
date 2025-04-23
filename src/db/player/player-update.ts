import { db, Player } from '../../db'
import eventTouch from '../event/event-touch'
import playerGet from './player-get'

export type PlayerUpdateInput = Partial<Pick<Player, 'name' | 'paid' | 'dropped'>>

export default async function playerUpdate(player: Player | string, input: PlayerUpdateInput) {
  if (typeof player === 'string') {
    player = await playerGet(player)
  }

  const result: Player = {
    ...player,
    ...input,
  }

  await db.players.update(player.id, result)
  await eventTouch(player.eventId)

  return result
}
