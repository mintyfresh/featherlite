import { db, Match } from '../../db'
import { RecordNotFoundError } from '../errors'
import playerUpdateStats from '../player/player-update-stats'
import matchGet from './match-get'

export default async function matchDelete(match: Match | string) {
  await db.transaction('rw', db.matches, db.players, async () => {
    try {
      if (typeof match === 'string') {
        match = await matchGet(match)
      }
    } catch (error) {
      // Just return false if the match doesn't exist
      if (error instanceof RecordNotFoundError) {
        return false
      }

      throw error
    }

    await db.matches.delete(match.id)
    await playerUpdateStats(match.playerIds)

    return true
  })
}
