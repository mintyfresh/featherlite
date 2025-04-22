import { db, Match } from '../db'

export interface PlayerStats {
  wins: number
  draws: number
  losses: number
  byes: number
  score: number
  opponentWinPercentage: number
}

export default async function playerBulkCalculateStats(ids: string[]) {
  const players = await db.players.where('id').anyOf(ids).toArray()
  const matches = await db.matches.where('playerIds').anyOf(ids).toArray()

  const playerMatches = new Map<string, Match[]>(
    players.map((player) => [
      player.id,
      matches.filter((match) => match.playerIds.includes(player.id))
    ])
  )

  return new Map<string, PlayerStats>(players.map((player) => {
    const matches = playerMatches.get(player.id) || []

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

    const score = (wins * 3) + (draws * 1) + (losses * 0)
    const opponentWinPercentage = opponentGames > 0 ? (opponentWins / opponentGames) * 100 : 0

    return [
      player.id,
      {
        wins,
        draws,
        losses,
        byes,
        score,
        opponentWinPercentage,
      }
    ]
  }))
}
