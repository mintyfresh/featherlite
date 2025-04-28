import { db, Player } from '../../db'
import playerGet from './player-get'
import playerValidate from './player-validate'

export type PlayerUpdateInput = Partial<Pick<Player, 'name' | 'paid' | 'dropped'>>

export default async function playerUpdate(player: Player | string, input: PlayerUpdateInput) {
  if (typeof player === 'string') {
    player = await playerGet(player)
  }

  const result: Player = {
    ...player,
    ...input,
  }

  await playerValidate(result)
  await db.players.update(player.id, result)

  return result
}
