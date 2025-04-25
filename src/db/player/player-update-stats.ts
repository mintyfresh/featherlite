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
  const opponentIds = new Set<string>()

  let wins = 0
  let draws = 0
  let losses = 0

  matches.forEach((match) => {
    const isBye = !match.playerIds[1]

    if (isBye) {
      wins++
      return
    }

    const opponentId = match.playerIds[0] === player.id ? match.playerIds[1]! : match.playerIds[0]
    opponentIds.add(opponentId)

    if (match.isDraw) {
      draws++
    } else if (match.winnerId === player.id) {
      wins++
    } else if (match.winnerId) {
      losses++
    }
  })

  const score = wins * POINTS_FOR_WIN + draws * POINTS_FOR_DRAW + losses * POINTS_FOR_LOSS
  const opponentWinRate = await calculateOpponentWinRate(opponentIds)

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

async function calculateOpponentWinRate(opponentIds: Set<string>): Promise<number> {
  if (opponentIds.size === 0) {
    return 0
  }

  const opponents = await db.players.where('id').anyOf(Array.from(opponentIds)).toArray()

  if (opponents.length === 0) {
    return 0
  }

  return (
    opponents.reduce((acc, opponent) => {
      // Calculate the number of matches played by the opponent
      const matches = opponent.wins + opponent.draws + opponent.losses

      // Calculate the win rate of the opponent
      return acc + opponent.wins / matches
    }, 0) / opponents.length
  ) // Average the win rates of all opponents
}
