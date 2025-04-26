import { useCallback, useEffect, useMemo, useState } from 'react'
import { Timer, TimerPhase } from '../db'
import timerCurrentPhase from '../db/timer/timer-current-phase'
import timerDelete from '../db/timer/timer-delete'
import timerPause from '../db/timer/timer-pause'
import timerReset from '../db/timer/timer-reset'
import timerSkipToNextPhase from '../db/timer/timer-skip-to-next-phase'
import timerTimeRemainingInCurrentPhase from '../db/timer/timer-time-remaining-in-current-phase'
import timerUnpause from '../db/timer/timer-unpause'
import { extractComponentsFromDuration } from '../utils/timer-helpers'
import { usePrevious } from '@mantine/hooks'

const POLLING_INTERVAL = 100 // millis

export interface UseTimerOptions {
  muted?: boolean
}

export default function useTimer(timer: Timer | null | undefined, { muted = false }: UseTimerOptions = {}) {
  const [phase, setPhase] = useState<TimerPhase | null>(null)
  const previousPhase = usePrevious(phase)

  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (timer?.id) {
      const interval = setInterval(() => {
        timerCurrentPhase(timer.id).then(setPhase)
        timerTimeRemainingInCurrentPhase(timer.id).then((timeRemaining) => {
          const [hours, minutes, seconds] = extractComponentsFromDuration(timeRemaining)

          setHours(hours)
          setMinutes(minutes)
          setSeconds(seconds)
        })
      }, POLLING_INTERVAL)

      return () => clearInterval(interval)
    }
  }, [timer?.id, timer?.pausedAt, timer?.expiresAt])

  // If using browser audio, preload the audio file
  const audio = useMemo(
    () =>
      typeof window.electron === 'undefined' && previousPhase?.audioClip
        ? new Audio(`/public/${previousPhase.audioClip}`)
        : null,
    [previousPhase?.audioClip]
  )

  // Play a sound when the timer reaches the end of the phase
  useEffect(() => {
    let isSubsequentPhase = false

    if (phase && previousPhase) {
      isSubsequentPhase = phase.offsetFromStart > previousPhase.offsetFromStart
    } else if (!phase && previousPhase) {
      isSubsequentPhase = true
    }

    if (isSubsequentPhase && previousPhase?.audioClip && !muted) {
      if (typeof window.electron !== 'undefined') {
        window.electron.playSound(previousPhase.audioClip)
      } else {
        audio?.play()
      }
    }
  }, [phase?.id, previousPhase?.id, previousPhase?.audioClip, audio, muted])

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
