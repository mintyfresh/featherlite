import { db, Event, Match, Round } from '../../db'
import eventGet from '../event/event-get'
import matchValidate from '../match/match-validate'
import playerUpdateStats from '../player/player-update-stats'

export type MatchCreateInput = {
  playerIds: [string, string | null]
}

export type RoundCreateInput = {
  matches: MatchCreateInput[]
}

export default async function roundCreate(event: Event | string, round: RoundCreateInput) {
  return await db.transaction('rw', db.events, db.rounds, db.matches, db.players, async () => {
    if (typeof event === 'string') {
      event = await eventGet(event)
    }

    // Technically, creating a round with just a single player will immediately complete the round
    const isComplete = round.matches.length === 1 && round.matches[0].playerIds[1] === null

    const result: Round = {
      id: crypto.randomUUID(),
      eventId: event.id,
      number: (event.currentRound ?? 0) + 1,
      isComplete,
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

      await matchValidate(matchResult)
      await db.matches.add(matchResult)

      // If this was a BYE, immediately update the winner's stats
      if (winnerId) {
        await playerUpdateStats(winnerId)
      }
    })

    return result
  })
}
