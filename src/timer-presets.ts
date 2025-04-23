import { TimerCreateInput } from './db/timer/timer-create'

const SECOND = 1000 // millis
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

export const timerPresets: Omit<TimerCreateInput, 'matchId'>[] = [
  {
    label: '45 Minute Game',
    phases: [
      {
        name: 'Setup',
        duration: 3 * MINUTE,
        colour: 0xFFC107,
      },
      {
        name: 'Time Remaining',
        duration: 45 * MINUTE,
        colour: 0x198754,
      },
      {
        name: 'Soft Time',
        duration: 5 * MINUTE,
        colour: 0xDC3545,
      },
    ],
  },
  {
    label: '2 Hour Game',
    phases: [
      {
        name: 'Setup',
        duration: 3 * MINUTE,
        colour: 0xFFC107,
      },
      {
        name: 'Time Remaining',
        duration: 2 * HOUR,
        colour: 0x198754,
      },
      // No soft time
    ],
  },
]
