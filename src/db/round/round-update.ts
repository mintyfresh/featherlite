import { db, Round } from '../../db'
import { OperationNotPermittedError } from '../errors'
import matchCreate from '../match/match-create'
import matchDelete from '../match/match-delete'
import { MatchCreateInput } from './round-create'
import roundGet from './round-get'
import roundIsUpdatable from './round-is-updatable'

export interface RoundUpdateInput {
  matches: MatchCreateInput[]
}

export default async function roundUpdate(round: Round | string, input: RoundUpdateInput) {
  return await db.transaction('rw', db.events, db.rounds, db.matches, db.players, async () => {
    if (typeof round === 'string') {
      round = await roundGet(round)
    }

    if (!(await roundIsUpdatable(round))) {
      throw new OperationNotPermittedError('Round', round.id, 'Cannot update a completed round')
    }

    // If the round has only one match and it's a BYE, it's complete
    const isComplete = input.matches.length === 1 && input.matches[0].playerIds[1] === null

    const result: Round = {
      ...round,
      isComplete,
    }

    // Remove all existing matches
    await Promise.all((await db.matches.where('roundId').equals(round.id).sortBy('table')).map(matchDelete))

    // Sort the matches so the BYE is always last
    const matches = [...input.matches].sort(
      (a: MatchCreateInput, b: MatchCreateInput) =>
        (a.playerIds[1] === null ? 1 : 0) - (b.playerIds[1] === null ? 1 : 0)
    )

    // Replace with new matches
    await Promise.all(
      matches.map((match, index) => matchCreate({ roundId: result.id, table: index + 1, playerIds: match.playerIds }))
    )

    await db.rounds.update(round.id, result)

    return result
  })
}
