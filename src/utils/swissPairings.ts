import { Swiss } from 'tournament-pairings'
import { db, Match } from '../db'
import { RecordNotFoundError } from '../db/errors'
import playerBulkCalculateStats from '../db/player-bulk-calculate-stats'

interface SwissPlayer {
  id: string | number
  score: number
  rating: number
  receivedBye?: boolean
}

export async function generateSwissPairings(
  eventId: string,
): Promise<Omit<Match, 'id' | 'roundId'>[]> {
  const event = await db.events.get(eventId)

  if (!event) {
    throw new RecordNotFoundError('Event', eventId)
  }

  // Filter out dropped players
  const activePlayers = (await db.players.where('eventId').equals(eventId).toArray()).filter(player => !player.dropped)
  const playerStats = await playerBulkCalculateStats(activePlayers.map((player) => player.id))

  // Create standings for each player
  const standings: SwissPlayer[] = activePlayers.map((player) => {
    const stats = playerStats.get(player.id)!

    return {
      id: player.id,
      score: stats.score,
      rating: stats.opponentWinPercentage,
      receivedBye: stats.byes > 0
    }
  })

  // Sort standings by score (descending) and opponent win percentage (descending)
  standings.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score
    } else {
      return b.rating - a.rating
    }
  })

  // Create Swiss pairings
  const round = (event.currentRound ?? 0) + 1
  const swiss = Swiss(standings, round, true)

  return swiss.map((match, index) => ({
    round,
    table: index + 1,
    playerIds: [match.player1! as string, match.player2 as string | null],
    winnerId: match.player2 ? null : (match.player1 as string),
    isDraw: false
  }))
}
