import { db, Event, Round } from '../../db'
import { RecordInvalidError } from '../errors'
import eventGet from '../event/event-get'
import matchCreate from '../match/match-create'

export type MatchCreateInput = {
  playerIds: [string, string | null]
}

export type RoundCreateInput = {
  matches: MatchCreateInput[]
}

export default async function roundCreate(event: Event | string, input: RoundCreateInput) {
  return await db.transaction('rw', db.events, db.rounds, db.matches, db.players, async () => {
    if (typeof event === 'string') {
      event = await eventGet(event)
    }

    if (input.matches.length === 0) {
      throw new RecordInvalidError('Round', null, [[null, 'At least one pairing is required']])
    }

    // Technically, creating a round with just a single player will immediately complete the round
    const isComplete = input.matches.length === 1 && input.matches[0].playerIds[1] === null

    const round: Round = {
      id: crypto.randomUUID(),
      eventId: event.id,
      number: (event.currentRound ?? 0) + 1,
      isComplete,
      updatedAt: new Date(),
    }

    // Sort the matches so the BYE is always last
    const matches = [...input.matches].sort(
      (a: MatchCreateInput, b: MatchCreateInput) =>
        (a.playerIds[1] === null ? 1 : 0) - (b.playerIds[1] === null ? 1 : 0)
    )

    await Promise.all(
      matches.map((match, index) => matchCreate({ roundId: round.id, table: index + 1, playerIds: match.playerIds }))
    )

    await db.rounds.add(round)
    await db.events.update(event.id, {
      currentRound: round.number,
      updatedAt: new Date(),
    })

    return round
  })
}
