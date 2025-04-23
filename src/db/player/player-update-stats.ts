import { db, Player } from '../../db'
import playerGet from './player-get'

const POINTS_FOR_WIN = 3
const POINTS_FOR_DRAW = 1
const POINTS_FOR_LOSS = 0

export default async function playerUpdateStats(player: Player | string) {
  if (typeof player === 'string') {
    player = await playerGet(player)
  }

  const matches = await db.matches.where('playerIds').equals(player.id).toArray()

  let wins = 0
  let draws = 0
  let losses = 0
  let byes = 0
  let opponentWins = 0
  let opponentGames = 0

  matches.forEach((match) => {
    const isBye = !match.playerIds[1]

    if (isBye) {
      wins++
      byes++
      return
    }

    opponentGames++

    if (match.isDraw) {
      draws++
    } else if (match.winnerId === player.id) {
      wins++
    } else if (match.winnerId) {
      losses++
      opponentWins++
    }
  })

  const score = (wins * POINTS_FOR_WIN) + (draws * POINTS_FOR_DRAW) + (losses * POINTS_FOR_LOSS)
  const opponentWinRate = opponentGames > 0 ? (opponentWins / opponentGames) : 0

  const result: Player = {
    ...player,
    wins,
    draws,
    losses,
    score,
    opponentWinRate,
  }

  await db.players.update(player.id, result)

  return result
}
