import { Event } from '../../db'
import { sha256Hexdigest } from '../../utils/crypto'
import eventExport, { EventExport } from './event-export'

export type EventExportBulk = {
  createdAt: Date
  events: EventExport[]
  version: number
  checksum: string
}

export default async function eventExportBulk(events: Event[]): Promise<EventExportBulk> {
  const result = {
    createdAt: new Date(),
    events: await Promise.all(events.map(eventExport)),
    version: 1,
  }

  const checksum = await sha256Hexdigest(JSON.stringify(result))

  return {
    ...result,
    checksum,
  }
}
