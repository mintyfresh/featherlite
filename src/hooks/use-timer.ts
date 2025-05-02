import { usePrevious } from '@mantine/hooks'
import { useCallback, useEffect, useState } from 'react'
import { Timer, TimerPhase } from '../db'
import { RecordNotFoundError } from '../db/errors'
import timerCurrentPhase from '../db/timer/timer-current-phase'
import timerDelete from '../db/timer/timer-delete'
import timerPause from '../db/timer/timer-pause'
import timerReset from '../db/timer/timer-reset'
import timerSkipToNextPhase from '../db/timer/timer-skip-to-next-phase'
import timerTimeRemainingInCurrentPhase from '../db/timer/timer-time-remaining-in-current-phase'
import timerUnpause from '../db/timer/timer-unpause'
import { extractComponentsFromDuration } from '../utils/timer-helpers'
import usePlayAudio from './use-play-audio'

const POLLING_INTERVAL = 100 // millis

export interface UseTimerOptions {
  muted?: boolean
}

export default function useTimer(timer: Timer | null | undefined, { muted = false }: UseTimerOptions = {}) {
  const [phase, setPhase] = useState<TimerPhase | null>(null)
  const previousPhase = usePrevious(phase)
  const playAudio = usePlayAudio(previousPhase?.audioClip ?? null)

  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (timer?.id) {
      const interval = setInterval(async () => {
        try {
          const currentPhase = await timerCurrentPhase(timer.id)
          const timeRemaining = await timerTimeRemainingInCurrentPhase(timer.id)
          const [hours, minutes, seconds] = extractComponentsFromDuration(timeRemaining)

          setPhase(currentPhase)
          setHours(hours)
          setMinutes(minutes)
          setSeconds(seconds)
        } catch (error) {
          if (error instanceof RecordNotFoundError) {
            // The timer was deleted, so we should stop polling
            console.log(`Timer ${timer.id} deleted, stopping polling`)
            clearInterval(interval)
          } else {
            throw error
          }
        }
      }, POLLING_INTERVAL)

      return () => clearInterval(interval)
    }
  }, [timer?.id, timer?.pausedAt, timer?.expiresAt])

  // Play a sound when the timer reaches the end of the phase
  useEffect(() => {
    let isSubsequentPhase = false

    if (phase && previousPhase) {
      isSubsequentPhase = phase.offsetFromStart > previousPhase.offsetFromStart
    } else if (!phase && previousPhase) {
      isSubsequentPhase = true
    }

    if (isSubsequentPhase && previousPhase?.audioClip && !muted) {
      playAudio()
    }
  }, [phase, previousPhase, previousPhase?.audioClip, muted, playAudio])

  const pause = useCallback(() => timer?.id && timerPause(timer.id), [timer?.id])
  const unpause = useCallback(() => timer?.id && timerUnpause(timer.id), [timer?.id])
  const skipToNextPhase = useCallback(() => timer?.id && timerSkipToNextPhase(timer.id), [timer?.id])
  const reset = useCallback(() => timer?.id && timerReset(timer.id), [timer?.id])
  const destroy = useCallback(() => timer?.id && timerDelete(timer.id), [timer?.id])

  return {
    phase,
    hours,
    minutes,
    seconds,
    pause,
    unpause,
    skipToNextPhase,
    reset,
    destroy,
  } as const
}
