import { db, Match } from '../db'
import { RecordNotFoundError } from './errors'

export type MatchUpdateInput = Partial<Pick<Match, 'winnerId' | 'isDraw'>>

export default async function matchUpdate(id: string, match: MatchUpdateInput) {
  const existingMatch = await db.matches.get(id)

  if (!existingMatch) {
    throw new RecordNotFoundError('Match', id)
  }

  const result: Match = {
    ...existingMatch,
    ...match,
  }

  if (result.isDraw && result.winnerId) {
    throw new Error('Match cannot be a draw and have a winner')
  }
  
  await db.matches.update(id, {
    winnerId: result.winnerId,
    isDraw: result.isDraw,
  })

  return result
}
