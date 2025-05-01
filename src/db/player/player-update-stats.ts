import { db, Player } from '../../db'
import playerGet from './player-get'

const POINTS_FOR_WIN = 3
const POINTS_FOR_DRAW = 1
const POINTS_FOR_LOSS = 0

export default async function playerUpdateStats(
  _players: (Player | string | null)[] | Player | string | null
): Promise<Player[]> {
  return await db.transaction('rw', db.players, db.matches, async () => {
    const players = await getPlayers(_players)

    if (players.length === 0) {
      return []
    }

    // Step 1: Calculate and update scoring for each player
    const scoredPlayers = await Promise.all(players.map(updatePlayerScore))

    // Step 2: Calculate and update opponent-win-rate for each player
    const result = await Promise.all(scoredPlayers.map(calculateOpponentWinRate))

    // Step 3: Calculate and update opponent-win-rate for all other players
    const otherPlayers = await db.players.where('eventId').equals(players[0]!.eventId)
      .filter((player) => !result.includes(player))
      .toArray()
    await Promise.all(otherPlayers.map(calculateOpponentWinRate))

    return result
  })
}

async function getPlayers(players: (Player | string | null)[] | Player | string | null): Promise<Player[]> {
  if (players === null) {
    return []
  }

  if (typeof players === 'string') {
    return [await playerGet(players)]
  }

  if (!Array.isArray(players)) {
    return [players]
  }

  return Promise.all(
    players
      .filter((player): player is Player => player !== null)
      .map((player): Promise<Player> => (typeof player === 'string' ? playerGet(player) : Promise.resolve(player)))
  )
}

async function updatePlayerScore(player: Player) {
  const matches = await db.matches.where('playerIds').equals(player.id).toArray()

  let wins = 0
  let draws = 0
  let losses = 0

  matches.forEach((match) => {
    const isBye = !match.playerIds[1]

    if (isBye) {
      wins++
      return
    }

    if (match.isDraw) {
      draws++
    } else if (match.winnerId === player.id) {
      wins++
    } else if (match.winnerId) {
      losses++
    }
  })

  const score = wins * POINTS_FOR_WIN + draws * POINTS_FOR_DRAW + losses * POINTS_FOR_LOSS

  const result: Player = {
    ...player,
    wins,
    draws,
    losses,
    score,
  }

  await db.players.update(player.id, result)

  return result
}

async function calculateOpponentWinRate(player: Player): Promise<Player> {
  const matches = await db.matches.where('playerIds').equals(player.id).toArray()

  const opponentIds = matches.flatMap((match) => match.playerIds)
    .filter((id) => id !== player.id) // filter out the player themselves
    .filter((id): id is string => id !== null) // filter out BYEs

  if (opponentIds.length === 0) {
    return player
  }

  const opponents = await db.players.where('id').anyOf(opponentIds).toArray()

  if (opponents.length === 0) {
    return player
  }

  const opponentWinRate =
    opponents.reduce((acc, opponent) => {
      // Calculate the number of matches played by the opponent
      const matches = opponent.wins + opponent.draws + opponent.losses

      if (matches === 0) {
        return acc
      }

      // Calculate the win rate of the opponent
      return acc + opponent.wins / matches
    }, 0) / opponents.length // Average the win rates of all opponents

  const result: Player = {
    ...player,
    opponentWinRate,
  }

  await db.players.update(player.id, result)

  return result
}
