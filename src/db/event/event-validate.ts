import { db, Event } from '../../db'
import { RecordValidationError } from '../errors'

export default async function eventValidate(event: Event) {
  const errors: [string | null, string][] = []

  if (!event.name?.trim()) {
    errors.push(['name', "can't be blank"])
  }

  if (event.name.length > 50) {
    errors.push(['name', 'must be less than 50 characters'])
  }

  if (!(await isEventNameUnique(event))) {
    errors.push(['name', 'must be unique'])
  }

  if (errors.length > 0) {
    throw new RecordValidationError('Event', event.id, errors)
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
