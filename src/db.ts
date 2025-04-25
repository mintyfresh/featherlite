import Dexie, { EntityTable } from 'dexie'

export interface Event {
  id: string
  name: string
  playersCount: number
  currentRound: number | null
  createdAt: Date
  updatedAt: Date
}

export interface Player {
  id: string
  eventId: string
  name: string
  paid: boolean
  dropped: boolean
  wins: number
  losses: number
  draws: number
  score: number
  opponentWinRate: number
}

export interface Round {
  id: string
  eventId: string
  number: number
  isComplete: boolean
  updatedAt: Date
}

export interface Match {
  id: string
  roundId: string
  table: number
  playerIds: [string, string | null]
  winnerId: string | null
  isDraw: boolean
}

export interface Timer {
  id: string
  roundId: string
  matchId: string | null
  label: string
  duration: number // millis
  expiresAt: Date
  pausedAt: Date | null
  createdAt: Date
}

export interface TimerPhase {
  id: string
  timerId: string
  audioClipId: string | null
  name: string
  position: number
  duration: number // millis
  offsetFromStart: number // millis
  offsetFromEnd: number // millis
  colour: number | null
}

export const db = new Dexie('featherlight-db') as Dexie & {
  events: EntityTable<Event, 'id'>
  players: EntityTable<Player, 'id'>
  rounds: EntityTable<Round, 'id'>
  matches: EntityTable<Match, 'id'>
  timers: EntityTable<Timer, 'id'>
  timerPhases: EntityTable<TimerPhase, 'id'>
}

db.version(1).stores({
  events: 'id, &name, createdAt',
  players: 'id, eventId, &[eventId+name]',
  rounds: 'id, eventId, &[eventId+number]',
  matches: 'id, roundId, &[roundId+table], *playerIds',
  timers: 'id, roundId, &matchId',
  timerPhases: 'id, timerId, &[timerId+position]',
})
