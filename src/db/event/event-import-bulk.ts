import { db } from '../../db'
import { sha256Hexdigest } from '../../utils/crypto'
import { DatabaseError } from '../errors'
import { EventExportBulk } from './event-export-bulk'
import eventImport from './event-import'

export default async function eventImportBulk(input: EventExportBulk) {
  const expectedChecksum = input.checksum

  const clone: Omit<EventExportBulk, 'checksum'> & { checksum?: string } = { ...input }
  delete clone.checksum

  const computedChecksum = await sha256Hexdigest(JSON.stringify(clone))

  if (expectedChecksum !== computedChecksum) {
    throw new DatabaseError(`Checksum mismatch: ${expectedChecksum} !== ${computedChecksum}`)
  }

  return await db.transaction('rw', db.events, db.players, db.rounds, db.matches, async () => {
    await Promise.all(input.events.map(eventImport))

    return true
  })
}
