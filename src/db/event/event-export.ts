import { Event } from '../../db'
import playerExport, { PlayerExport } from '../player/player-export'
import roundExport, { RoundExport } from '../round/round-export'
import eventGet from './event-get'
import eventPlayers from './event-players'
import eventRounds from './event-rounds'

export type EventExport = Event & {
  players: PlayerExport[]
  rounds: RoundExport[]
}

export default async function eventExport(event: Event | string): Promise<EventExport> {
  if (typeof event === 'string') {
    event = await eventGet(event)
  }

  const players = await eventPlayers(event)
  const rounds = await eventRounds(event)

  return {
    ...event,
    players: await Promise.all(players.map(playerExport)),
    rounds: await Promise.all(rounds.map(roundExport)),
  }
}
