import { db } from '../db'
import { RecordNotFoundError } from './errors'

export default async function roundGet(id: string) {
  const result = await db.rounds.get(id)

  if (!result) {
    throw new RecordNotFoundError('Round', id)
  }

  return result
}
