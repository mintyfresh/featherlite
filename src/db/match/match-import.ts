import { db } from '../../db'
import { OperationNotPermittedError } from '../errors'
import { MatchExport } from './match-export'
import matchValidate from './match-validate'

export default async function matchImport(input: MatchExport) {
  if (!input.id) {
    throw new OperationNotPermittedError('Match', null, 'ID is required')
  }

  await matchValidate(input)
  await db.matches.put(input)

  return true
}
