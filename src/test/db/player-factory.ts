import { Player } from '../../db'

export function buildPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    eventId: 'event-1',
    name: 'Mock Player',
    paid: false,
    dropped: false,
    wins: 0,
    losses: 0,
    draws: 0,
    score: 0,
    opponentWinRate: 0,
    ...overrides,
  }
}
