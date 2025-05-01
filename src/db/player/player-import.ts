import { db } from '../../db'
import { OperationNotPermittedError } from '../errors'
import { PlayerExport } from './player-export'
import playerValidate from './player-validate'

export default async function playerImport(input: PlayerExport) {
  if (!input.id) {
    throw new OperationNotPermittedError('Player', null, 'ID is required')
  }

  await playerValidate(input)
  await db.players.put(input)

  return true
}
