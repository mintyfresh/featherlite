import { Round } from '../../db'
import crypto from 'crypto'

export function buildRound(overrides: Partial<Round> = {}): Round {
  return {
    id: crypto.randomUUID(),
    eventId: crypto.randomUUID(),
    number: 1,
    isComplete: false,
    ...overrides,
  }
}
