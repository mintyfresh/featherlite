import { db } from '../../db'
import { OperationNotPermittedError } from '../errors'
import playerImport from '../player/player-import'
import roundImport from '../round/round-import'
import { EventExport } from './event-export'
import eventValidate from './event-validate'

export default async function eventImport(input: EventExport) {
  return await db.transaction('rw', db.events, db.players, db.rounds, db.matches, async () => {
    if (!input.id) {
      throw new OperationNotPermittedError('Event', null, 'ID is required')
    }

    await eventValidate(input)
    await db.events.put(input)
    await Promise.all(input.players.map(playerImport))
    await Promise.all(input.rounds.map(roundImport))

    return true
  })
}
