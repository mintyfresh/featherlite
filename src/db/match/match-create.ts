import { db, Match } from '../../db'
import playerUpdateStats from '../player/player-update-stats'
import matchValidate from './match-validate'

export interface MatchCreateInput {
  roundId: string
  table: number
  playerIds: [string, string | null]
}

export default async function matchCreate(input: MatchCreateInput) {
  await db.transaction('rw', db.matches, db.players, async () => {
    const isBye = !input.playerIds[1]
    const winnerId = isBye ? input.playerIds[0] : null

    const match: Match = {
      id: crypto.randomUUID(),
      roundId: input.roundId,
      table: input.table,
      playerIds: input.playerIds,
      winnerId,
      isDraw: false,
    }

    await matchValidate(match)
    await db.matches.add(match)

    if (winnerId) {
      await playerUpdateStats(winnerId)
    }

    return match
  })
}
