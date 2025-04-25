import { db, Round } from '../../db'

export default async function roundMatches(round: Round | string) {
  const roundId = typeof round === 'string' ? round : round.id

  return db.matches.where('roundId').equals(roundId).sortBy('table')
}
