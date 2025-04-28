import { db, Round, Timer } from '../../db'
import roundGet from '../round/round-get'
import { OperationNotPermittedError } from '../errors'

export interface TimerCreateInput {
  matchId: string | null
  label: string
  phases: TimerPhaseCreateInput[]
}

export interface TimerPhaseCreateInput {
  name: string
  audioClip: string | null
  duration: number
  colour: number | null
}

export default async function timerCreate(round: Round | string, input: TimerCreateInput) {
  return await db.transaction('rw', db.rounds, db.timers, db.timerPhases, async () => {
    if (typeof round === 'string') {
      round = await roundGet(round)
    }

    if (input.phases.length < 1) {
      throw new OperationNotPermittedError('Timer', null, 'Cannot create a timer with no phases')
    }

    const duration = input.phases.reduce((acc, phase) => acc + phase.duration, 0)

    if (duration <= 0) {
      throw new OperationNotPermittedError('Timer', null, 'Cannot create a timer with a duration of 0')
    }

    const expiresAt = new Date(Date.now() + duration)
    expiresAt.setMilliseconds(0) // round to nearest second

    const timer: Timer = {
      id: crypto.randomUUID(),
      roundId: round.id,
      matchId: input.matchId,
      label: input.label,
      duration, // total duration in millis
      expiresAt,
      pausedAt: null,
      createdAt: new Date(),
    }

    let timeElapsed = 0

    for (const [index, phase] of input.phases.entries()) {
      await db.timerPhases.add({
        id: crypto.randomUUID(),
        timerId: timer.id,
        audioClip: phase.audioClip,
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
