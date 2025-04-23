import { db, Round } from '../../db'

export default async function roundTimers(round: Round | string) {
  const roundId = typeof round === 'string' ? round : round.id

  return await db.timers.where('roundId').equals(roundId).sortBy('createdAt')
}
