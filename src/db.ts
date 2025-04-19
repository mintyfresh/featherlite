import { openDB, DBSchema } from 'idb'

interface Event {
  id: string
  name: string
  playerCount?: number
  createdAt: Date
}

interface MyDB extends DBSchema {
  events: {
    key: string
    value: Event
    indexes: { 
      'by-date': Date
      'by-name': string 
    }
  }
}

const dbPromise = openDB<MyDB>('mlpccg-tournament', 1, {
  upgrade(db) {
    const store = db.createObjectStore('events', {
      keyPath: 'id',
    })
    store.createIndex('by-date', 'createdAt')
    store.createIndex('by-name', 'name', { unique: true })
  },
})

export async function getAllEvents() {
  const events = await (await dbPromise).getAllFromIndex('events', 'by-date')
  return events.reverse()
}

export async function checkEventNameExists(name: string, excludeId?: string): Promise<boolean> {
  const db = await dbPromise
  const existingEvent = await db.getFromIndex('events', 'by-name', name)
  if (!existingEvent) return false
  if (excludeId && existingEvent.id === excludeId) return false
  return true
}

export async function addEvent(event: Omit<Event, 'id'>) {
  const exists = await checkEventNameExists(event.name)
  if (exists) throw new Error('An event with this name already exists')
  
  const id = crypto.randomUUID()
  return (await dbPromise).add('events', { ...event, id })
}

export async function updateEvent(id: string, event: Pick<Event, 'name'>) {
  const exists = await checkEventNameExists(event.name, id)
  if (exists) throw new Error('An event with this name already exists')
  
  const db = await dbPromise
  const existingEvent = await db.get('events', id)
  if (!existingEvent) throw new Error('Event not found')
  return db.put('events', { ...existingEvent, ...event })
}

export async function deleteEvent(id: string) {
  return (await dbPromise).delete('events', id)
}

export type { Event }
