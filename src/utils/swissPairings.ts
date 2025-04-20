import { Swiss } from 'tournament-pairings'
import { Match, Player } from '../db'

interface SwissPlayer {
  id: string | number
  score: number
  rating: number
  receivedBye?: boolean
}

export function generateSwissPairings(
  players: Player[],
  previousMatches: Match[],
  round: number
): Omit<Match, 'id' | 'eventId'>[] {
  // Filter out dropped players
  const activePlayers = players.filter(player => !player.dropped)

  // Create standings for each player
  const standings: SwissPlayer[] = activePlayers.map(player => {
    const playerMatches = previousMatches.filter(match =>
      match.player1Id === player.id || match.player2Id === player.id
    )

    let wins = 0
    let draws = 0
    let opponentWins = 0
    let opponentGames = 0
    let byes = 0

    playerMatches.forEach(match => {
      const isPlayer1 = match.player1Id === player.id
      const isBye = !match.player2Id

      if (isBye && isPlayer1) {
        wins++
        byes++
        return
      }

      if (match.isDraw) {
        draws++
        opponentGames++
      } else if (match.winnerId === player.id) {
        wins++
        if (match.winnerId === (isPlayer1 ? match.player2Id : match.player1Id)) {
          opponentWins++
          opponentGames++
        }
      } else if (match.winnerId) {
        if (match.winnerId === (isPlayer1 ? match.player2Id : match.player1Id)) {
          opponentWins++
          opponentGames++
        }
      }
    })

    const score = (wins * 3) + draws
    const opponentWinPercentage = opponentGames > 0
      ? (opponentWins / opponentGames) * 100
      : 0

    return {
      id: player.id,
      score,
      rating: opponentWinPercentage,
      receivedBye: byes > 0
    }
  })

  // Sort standings by score (descending) and opponent win percentage (descending)
  standings.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    return b.rating - a.rating
  })

  // Create Swiss pairings
  const swiss = Swiss(standings, round, true)

  return swiss.map((match, index) => ({
    round,
    table: index + 1,
    player1Id: match.player1! as string,
    player2Id: match.player2 as string,
    winnerId: match.player2 ? null : (match.player1 as string),
    isDraw: false
  }))
}
