import { Match } from '../../db'
import crypto from 'crypto'

export function buildMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: crypto.randomUUID(),
    roundId: crypto.randomUUID(),
    table: 1,
    playerIds: ['player-1', 'player-2'],
    winnerId: null,
    isDraw: false,
    ...overrides,
  }
}
