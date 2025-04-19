import { openDB, DBSchema } from 'idb'

interface Event {
  id: string
  name: string
  playerCount?: number
  createdAt: Date
}

interface Player {
  id: string
  eventId: string
  name: string
  paid: boolean
  dropped: boolean
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
  players: {
    key: string
    value: Player
    indexes: {
      'by-event': string
    }
  }
}

const dbPromise = openDB<MyDB>('mlpccg-tournament', 1, {
  upgrade(db) {
    const eventStore = db.createObjectStore('events', {
      keyPath: 'id',
    })
    eventStore.createIndex('by-date', 'createdAt')
    eventStore.createIndex('by-name', 'name', { unique: true })

    const playerStore = db.createObjectStore('players', {
      keyPath: 'id',
    })
    playerStore.createIndex('by-event', 'eventId')
  },
})

// Event functions
export async function getAllEvents() {
  const events = await (await dbPromise).getAllFromIndex('events', 'by-date')
  return events.reverse()
}

export async function getEvent(id: string) {
  return (await dbPromise).get('events', id)
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
  const db = await dbPromise
  // Delete all players associated with this event
  const players = await db.getAllFromIndex('players', 'by-event', id)
  await Promise.all(players.map(player => db.delete('players', player.id)))
  return db.delete('events', id)
}

// Player functions
export async function getEventPlayers(eventId: string) {
  return (await dbPromise).getAllFromIndex('players', 'by-event', eventId)
}

export async function addPlayer(eventId: string, player: Omit<Player, 'id' | 'eventId'>) {
  const id = crypto.randomUUID()
  return (await dbPromise).add('players', { ...player, id, eventId })
}

export async function updatePlayer(id: string, player: Partial<Omit<Player, 'id' | 'eventId'>>) {
  const db = await dbPromise
  const existingPlayer = await db.get('players', id)
  if (!existingPlayer) throw new Error('Player not found')
  return db.put('players', { ...existingPlayer, ...player })
}

export async function deletePlayer(id: string) {
  return (await dbPromise).delete('players', id)
}

export type { Event, Player }
