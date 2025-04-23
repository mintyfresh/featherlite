import { db, Event } from '../db'
import { RecordInvalidError } from './errors'

export default async function eventValidate(event: Event) {
  if (!await isEventNameUnique(event)) {
    throw new RecordInvalidError(`Event already exists with name '${event.name}'`)
  }

  return event
}

async function isEventNameUnique(event: Event) {
  const existingEvent = await db.events.get({ name: event.name })

  if (existingEvent) {
    return event.id ? existingEvent.id === event.id : false
  } else {
    return true
  }
}
