import Dexie, { EntityTable } from 'dexie'

export interface Event {
  id: string
  name: string
  playersCount: number
  currentRound: number | null
  createdAt: Date
}

export interface Player {
  id: string
  eventId: string
  name: string
  paid: boolean
  dropped: boolean
}

export interface Round {
  id: string
  eventId: string
  number: number
  isComplete: boolean
}

export interface Match {
  id: string
  roundId: string
  table: number
  playerIds: [string, string] | [string, null]
  winnerId: string | null
  isDraw: boolean
}

export const db = new Dexie('featherlight-db') as Dexie & {
  events: EntityTable<Event, 'id'>,
  players: EntityTable<Player, 'id'>,
  rounds: EntityTable<Round, 'id'>,
  matches: EntityTable<Match, 'id'>,
}

db.version(1).stores({
  events: 'id, &name, createdAt',
  players: 'id, eventId, &[eventId+name]',
  rounds: 'id, eventId, &[eventId+number]',
  matches: 'id, roundId, &[roundId+table], *playerIds',
})
