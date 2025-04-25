import { db, Round, Timer } from '../../db'
import roundGet from '../round/round-get'
import { RecordInvalidError } from '../errors'

export interface TimerCreateInput {
  matchId: string | null
  label: string
  phases: TimerPhaseCreateInput[]
}

export interface TimerPhaseCreateInput {
  name: string
  duration: number
  colour: number | null
}

export default async function timerCreate(round: Round | string, input: TimerCreateInput) {
  return await db.transaction('rw', db.rounds, db.timers, db.timerPhases, async () => {
    if (typeof round === 'string') {
      round = await roundGet(round)
    }

    if (input.phases.length < 1) {
      throw new RecordInvalidError('At least one phase is required')
    }

    const duration = input.phases.reduce((acc, phase) => acc + phase.duration, 0)

    if (duration <= 0) {
      throw new RecordInvalidError('Duration must be greater than 0')
    }

    const timer: Timer = {
      id: crypto.randomUUID(),
      roundId: round.id,
      matchId: input.matchId,
      label: input.label,
      duration, // total duration in millis
      expiresAt: new Date(Date.now() + duration),
      pausedAt: null,
      createdAt: new Date(),
    }

    let timeElapsed = 0

    for (const [index, phase] of input.phases.entries()) {
      await db.timerPhases.add({
        id: crypto.randomUUID(),
        timerId: timer.id,
        audioClipId: null,
        name: phase.name,
        position: index,
        duration: phase.duration,
        offsetFromStart: timeElapsed, // time elapsed since start of timer
        offsetFromEnd: duration - (timeElapsed += phase.duration), // time remaining until end of timer
        colour: phase.colour,
      })
    }

    await db.timers.add(timer)

    return timer
  })
}
