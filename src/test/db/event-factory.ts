import { Event } from '../../db'

export function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-1',
    name: 'Mock Event',
    playersCount: 0,
    currentRound: 1,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    ...overrides,
  }
}
