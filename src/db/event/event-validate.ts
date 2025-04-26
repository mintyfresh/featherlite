import { db, Event } from '../../db'
import { RecordInvalidError } from '../errors'

export default async function eventValidate(event: Event) {
  const errors: [string | null, string][] = []

  if (!event.name?.trim()) {
    errors.push(['name', "can't be blank"])
  }

  if (!(await isEventNameUnique(event))) {
    errors.push(['name', 'must be unique'])
  }

  if (errors.length > 0) {
    throw new RecordInvalidError('Event', event.id, errors)
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
