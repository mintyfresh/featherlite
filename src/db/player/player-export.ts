import { Player } from '../../db'
import playerGet from './player-get'

export type PlayerExport = Player

export default async function playerExport(player: Player | string): Promise<PlayerExport> {
  if (typeof player === 'string') {
    player = await playerGet(player)
  }

  return player
}
