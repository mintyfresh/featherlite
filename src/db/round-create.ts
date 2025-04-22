import { db, Match, Round } from '../db'
import { RecordNotFoundError } from './errors'

export type MatchCreateInput = {
  playerIds: [string, string] | [string, null]
}

export type RoundCreateInput = {
  matches: MatchCreateInput[]
}

export default async function roundCreate(eventId: string, round: RoundCreateInput) {
  return await db.transaction('rw', db.events, db.rounds, db.matches, async () => {
    const event = await db.events.get(eventId)

    if (!event) {
      throw new RecordNotFoundError('Event', eventId)
    }

    const result: Round = {
      id: crypto.randomUUID(),
      eventId,
      number: (event.currentRound ?? 0) + 1,
      isComplete: false
    }

    await db.rounds.add(result)
    await db.events.update(eventId, {
      currentRound: result.number,
    })

    round.matches.forEach(async ({ playerIds }, index) => {
      const isBye = !playerIds[1]
      const winnerId = isBye ? playerIds[0] : null

      const matchResult: Match = {
        id: crypto.randomUUID(),
        roundId: result.id,
        table: index + 1,
        playerIds,
        winnerId,
        isDraw: false,
      }

      await db.matches.add(matchResult)
    })

    return result
  })
}
