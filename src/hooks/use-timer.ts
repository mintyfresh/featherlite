import { useCallback, useEffect, useState } from 'react'
import { Timer, TimerPhase } from '../db'
import timerCurrentPhase from '../db/timer/timer-current-phase'
import timerDelete from '../db/timer/timer-delete'
import timerPause from '../db/timer/timer-pause'
import timerReset from '../db/timer/timer-reset'
import timerSkipToNextPhase from '../db/timer/timer-skip-to-next-phase'
import timerTimeRemainingInCurrentPhase from '../db/timer/timer-time-remaining-in-current-phase'
import timerUnpause from '../db/timer/timer-unpause'
import { extractComponentsFromDuration } from '../utils/timer-helpers'

export default function useTimer(timer: Timer | null | undefined) {
  const [phase, setPhase] = useState<TimerPhase | null>(null)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (timer) {
      const interval = setInterval(() => {
        timerCurrentPhase(timer).then(setPhase)
        timerTimeRemainingInCurrentPhase(timer).then((timeRemaining) => {
          const [hours, minutes, seconds] = extractComponentsFromDuration(timeRemaining)

          setHours(hours)
          setMinutes(minutes)
          setSeconds(seconds)
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [timer?.id, timer?.pausedAt, timer?.expiresAt])

  const pause = useCallback(() => timer && timerPause(timer.id), [timer?.id])

  const unpause = useCallback(() => timer && timerUnpause(timer.id), [timer?.id])

  const skipToNextPhase = useCallback(() => timer && timerSkipToNextPhase(timer.id), [timer?.id])

  const reset = useCallback(() => timer && timerReset(timer.id), [timer?.id])

  const destroy = useCallback(() => timer && timerDelete(timer.id), [timer?.id])

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
