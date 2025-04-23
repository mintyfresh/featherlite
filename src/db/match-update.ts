import { db, Match, Round } from '../db'
import matchGet from './match-get'
import matchValidate from './match-validate'
import roundGet from './round-get'

export type MatchUpdateInput = Partial<Pick<Match, 'winnerId' | 'isDraw'>>

export default async function matchUpdate(match: Match | string, input: MatchUpdateInput) {
  return await db.transaction('rw', db.matches, db.rounds, async () => {
    if (typeof match === 'string') {
      match = await matchGet(match)
    }

    const result: Match = {
      ...match,
      ...input,
    }

    await matchValidate(result)
    await db.matches.update(match.id, input)

    // Update the completedness state of the round
    const round = await roundGet(match.roundId)
    await db.rounds.update(round.id, {
      isComplete: await allMatchesComplete(round),
      updatedAt: new Date(),
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
