import { db, Match, Round } from '../../db'
import matchGet from './match-get'
import matchValidate from './match-validate'
import roundGet from '../round/round-get'
import playerUpdateStats from '../player/player-update-stats'

export type MatchUpdateInput = Partial<Pick<Match, 'winnerId' | 'isDraw'>>

export default async function matchUpdate(match: Match | string, input: MatchUpdateInput) {
  return await db.transaction('rw', db.matches, db.rounds, db.players, async () => {
    if (typeof match === 'string') {
      match = await matchGet(match)
    }

    const result: Match = {
      ...match,
      ...input,
    }

    await matchValidate(result)
    await db.matches.update(match.id, input)

    // Update the stats of each of the players
    await Promise.all(result.playerIds.map((playerId) => playerId && playerUpdateStats(playerId)))

    // Update the completedness state of the round
    const round = await roundGet(match.roundId)
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
