import { Timer } from '../../db'

export function buildTimer(overrides: Partial<Timer> = {}): Timer {
  const duration = overrides.duration ?? 60000
  const expiresAt = overrides.expiresAt ?? new Date(Date.now() + duration)

  return {
    id: 'timer-1',
    roundId: 'round-1',
    matchId: null,
    label: 'Timer',
    duration,
    expiresAt,
    pausedAt: null,
    createdAt: new Date(),
    ...overrides,
  }
}
