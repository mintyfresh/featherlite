import { Match } from '../../db'
import { RecordInvalidError } from '../errors'

export default async function matchValidate(match: Match) {
  const errors: [string | null, string][] = []

  if (!match.roundId) {
    errors.push(['roundId', 'is required'])
  }

  if (!match.table || match.table < 1) {
    errors.push(['table', 'must be greater than 0'])
  }

  if (!match.playerIds || match.playerIds.length !== 2 || !match.playerIds[0]) {
    errors.push(['playerIds', 'must have either one or two players'])
  }

  if (match.playerIds[0] === match.playerIds[1]) {
    errors.push(['playerIds', 'cannot have players play against themselves'])
  }

  if (match.winnerId && !match.playerIds.includes(match.winnerId)) {
    errors.push(['winnerId', 'must be one of the players'])
  }

  if (match.winnerId && match.isDraw) {
    errors.push([null, 'cannot have a winner and be a draw'])
  }

  if (errors.length > 0) {
    throw new RecordInvalidError('Match', match.id, errors)
  }

  return match
}
