import { db } from '../../db'
import { OperationNotPermittedError } from '../errors'
import matchImport from '../match/match-import'
import { RoundExport } from './round-export'

export default async function roundImport(input: RoundExport) {
  return await db.transaction('rw', db.rounds, db.matches, async () => {
    if (!input.id) {
      throw new OperationNotPermittedError('Round', null, 'ID is required')
    }

    await db.rounds.put(input)
    await Promise.all(input.matches.map(matchImport))

    return true
  })
}
