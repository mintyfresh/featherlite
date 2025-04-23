import { Match } from '../../db'
import { RecordInvalidError } from '../errors'

export default async function matchValidate(match: Match) {
  if (!match.roundId) {
    throw new RecordInvalidError('Match must be associated with a round')
  }

  if (!match.table || match.table < 1) {
    throw new RecordInvalidError('Match must have a table number')
  }

  if (!match.playerIds || match.playerIds.length !== 2 || !match.playerIds[0]) {
    throw new RecordInvalidError('Match must have either one or two players')
  }

  if (match.playerIds[0] === match.playerIds[1]) {
    throw new RecordInvalidError('Players cannot play against themselves')
  }

  if (match.winnerId && !match.playerIds.includes(match.winnerId)) {
    throw new RecordInvalidError('Winner must be one of the players')
  }

  if (match.winnerId && match.isDraw) {
    throw new RecordInvalidError('Match cannot be a draw and have a winner')
  }

  return match
}
