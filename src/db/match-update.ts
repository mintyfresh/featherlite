import { db, Match, Round } from '../db'
import { RecordNotFoundError } from './errors'

export type MatchUpdateInput = Partial<Pick<Match, 'winnerId' | 'isDraw'>>

export default async function matchUpdate(id: string, match: MatchUpdateInput) {
  return await db.transaction('rw', db.matches, db.rounds, async () => {
    const existingMatch = await db.matches.get(id)

    if (!existingMatch) {
      throw new RecordNotFoundError('Match', id)
    }

    const round = await db.rounds.get(existingMatch.roundId)

    if (!round) {
      throw new RecordNotFoundError('Round', existingMatch.roundId)
    }

    const result: Match = {
      ...existingMatch,
      ...match,
    }

    // Prevent invalid match states
    if (result.isDraw && result.winnerId) {
      throw new Error('Match cannot be a draw and have a winner')
    }

    await db.matches.update(id, {
      winnerId: result.winnerId,
      isDraw: result.isDraw,
    })

    // Update the completedness state of the round
    await db.rounds.update(round.id, {
      isComplete: await allMatchesComplete(round),
    })

    return result
  })
}

async function allMatchesComplete(round: Round) {
  return (await db.matches.where('roundId').equals(round.id).toArray()).every(isComplete)
}

function isComplete(match: Match) {
  return match.winnerId !== null || match.isDraw
}
