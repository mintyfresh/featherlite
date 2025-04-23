import { db, Event, Match, Round } from '../db'
import eventGet from './event-get'

export type MatchCreateInput = {
  playerIds: [string, string] | [string, null]
}

export type RoundCreateInput = {
  matches: MatchCreateInput[]
}

export default async function roundCreate(event: Event | string, round: RoundCreateInput) {
  return await db.transaction('rw', db.events, db.rounds, db.matches, async () => {
    if (typeof event === 'string') {
      event = await eventGet(event)
    }

    const result: Round = {
      id: crypto.randomUUID(),
      eventId: event.id,
      number: (event.currentRound ?? 0) + 1,
      isComplete: false,
      updatedAt: new Date(),
    }

    await db.rounds.add(result)
    await db.events.update(event.id, {
      currentRound: result.number,
      updatedAt: new Date(),
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
