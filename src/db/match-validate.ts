import { Match } from '../db'
import { RecordInvalidError } from './errors'

export default async function matchValidate(match: Match) {
  if (match.winnerId && match.isDraw) {
    throw new RecordInvalidError('Match cannot be a draw and have a winner')
  }

  return match
}
