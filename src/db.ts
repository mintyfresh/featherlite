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

interface Match {
  id: string
  eventId: string
  round: number
  tableNumber: number
  player1Id: string
  player2Id?: string
  winnerId?: string
  isDraw: boolean
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
  matches: {
    key: string
    value: Match
    indexes: {
      'by-event': string
      'by-round': [string, number]
      'by-table': [string, number, number]
      'by-player1': string
      'by-player2': string
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

    const matchStore = db.createObjectStore('matches', {
      keyPath: 'id',
    })
    matchStore.createIndex('by-event', 'eventId')
    matchStore.createIndex('by-round', ['eventId', 'round'])
    matchStore.createIndex('by-table', ['eventId', 'round', 'tableNumber'], { unique: true })
    matchStore.createIndex('by-player1', 'player1Id')
    matchStore.createIndex('by-player2', 'player2Id')
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
  // Delete all players and matches associated with this event
  const players = await db.getAllFromIndex('players', 'by-event', id)
  const matches = await db.getAllFromIndex('matches', 'by-event', id)
  await Promise.all([
    ...players.map(player => db.delete('players', player.id)),
    ...matches.map(match => db.delete('matches', match.id))
  ])
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
  const db = await dbPromise
  // Delete all matches associated with this player
  const matches1 = await db.getAllFromIndex('matches', 'by-player1', id)
  const matches2 = await db.getAllFromIndex('matches', 'by-player2', id)
  await Promise.all([
    ...matches1.map(match => db.delete('matches', match.id)),
    ...matches2.map(match => db.delete('matches', match.id))
  ])
  return db.delete('players', id)
}

// Match functions
export async function getRoundMatches(eventId: string, round: number) {
  return (await dbPromise).getAllFromIndex('matches', 'by-round', [eventId, round])
}

export async function getPlayerMatches(eventId: string, playerId: string) {
  const db = await dbPromise
  const allMatches = await db.getAllFromIndex('matches', 'by-event', eventId)
  return allMatches.filter(match => 
    match.player1Id === playerId || match.player2Id === playerId
  )
}

export async function addMatch(eventId: string, match: Omit<Match, 'id' | 'eventId'>) {
  const id = crypto.randomUUID()
  return (await dbPromise).add('matches', { ...match, id, eventId })
}

export async function updateMatch(id: string, match: Partial<Omit<Match, 'id' | 'eventId'>>) {
  const db = await dbPromise
  const existingMatch = await db.get('matches', id)
  if (!existingMatch) throw new Error('Match not found')
  return db.put('matches', { ...existingMatch, ...match })
}

export async function deleteMatch(id: string) {
  return (await dbPromise).delete('matches', id)
}

// Statistics functions
export async function getPlayerStats(eventId: string, playerId: string) {
  const matches = await getPlayerMatches(eventId, playerId)
  let wins = 0
  let draws = 0
  let losses = 0
  let opponentWins = 0
  let opponentGames = 0

  matches.forEach(match => {
    const isPlayer1 = match.player1Id === playerId
    const isBye = !match.player2Id

    if (isBye && isPlayer1) {
      wins++
      return
    }

    if (match.isDraw) {
      draws++
      opponentGames++
    } else if (match.winnerId === playerId) {
      wins++
      if (match.winnerId === (isPlayer1 ? match.player2Id : match.player1Id)) {
        opponentWins++
        opponentGames++
      }
    } else if (match.winnerId) {
      losses++
      if (match.winnerId === (isPlayer1 ? match.player2Id : match.player1Id)) {
        opponentWins++
        opponentGames++
      }
    }
  })

  const score = (wins * 3) + draws
  const opponentWinPercentage = opponentGames > 0 
    ? (opponentWins / opponentGames) * 100
    : 0

  return {
    wins,
    draws,
    losses,
    score,
    opponentWinPercentage,
  }
}

export type { Event, Player, Match }
