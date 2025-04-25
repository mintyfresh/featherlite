import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { Timer, TimerPhase } from '../db'
import timerCurrentPhase from '../db/timer/timer-current-phase'
import timerDelete from '../db/timer/timer-delete'
import timerPause from '../db/timer/timer-pause'
import timerReset from '../db/timer/timer-reset'
import timerSkipToNextPhase from '../db/timer/timer-skip-to-next-phase'
import timerTimeRemainingInCurrentPhase from '../db/timer/timer-time-remaining-in-current-phase'
import timerUnpause from '../db/timer/timer-unpause'
import { extractComponentsFromDuration } from '../utils/timer-helpers'

function usePreviousState<T>(value: T) {
  const ref = useRef<T>(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export default function useTimer(timer: Timer | null | undefined, { playSound = true }: { playSound?: boolean } = {}) {
  const [phase, setPhase] = useState<TimerPhase | null>(null)
  const endOfPhaseSound = usePreviousState(phase?.audioClip)
  const audio = useMemo(() => (window.electron || !endOfPhaseSound || !playSound ? null : new Audio(`/public/${endOfPhaseSound}`)), [endOfPhaseSound, playSound])

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
      }, 250)

      return () => clearInterval(interval)
    }
  }, [timer?.id, timer?.pausedAt, timer?.expiresAt])

  // Play a sound when the timer reaches the end of the phase
  useEffect(() => {
    if (hours === 0 && minutes === 0 && seconds === 0 && endOfPhaseSound) {
      if (window.electron) {
        window.electron.playSound(endOfPhaseSound)
      } else {
        audio?.play()
      }
    }
  }, [endOfPhaseSound, hours, minutes, seconds])

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
