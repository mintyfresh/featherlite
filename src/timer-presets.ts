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
        colour: 0xffc107,
        audioClip: 'begin.wav',
      },
      {
        name: 'Time Remaining',
        duration: 45 * MINUTE,
        colour: 0x198754,
        audioClip: 'over.wav',
      },
      {
        name: 'Soft Time',
        duration: 5 * MINUTE,
        colour: 0xdc3545,
        audioClip: 'time.wav',
      },
    ],
  },
  {
    label: '2 Hour Game',
    phases: [
      {
        name: 'Setup',
        duration: 3 * MINUTE,
        colour: 0xffc107,
        audioClip: 'begin.wav',
      },
      {
        name: 'Time Remaining',
        duration: 2 * HOUR,
        colour: 0x198754,
        audioClip: 'time.wav',
      },
      // No soft time
    ],
  },
  {
    label: 'Sound-check Timer',
    phases: [
      {
        name: 'Setup',
        duration: 5 * SECOND,
        colour: 0xffc107,
        audioClip: 'begin.wav',
      },
      {
        name: 'Time Remaining',
        duration: 5 * SECOND,
        colour: 0x198754,
        audioClip: 'over.wav',
      },
      {
        name: 'Soft Time',
        duration: 5 * SECOND,
        colour: 0xdc3545,
        audioClip: 'time.wav',
      },
    ],
  },
]
