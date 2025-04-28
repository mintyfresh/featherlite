import { Button, Group, Paper, Select, Stack, Text } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Event } from '../../db'
import eventCurrentRound from '../../db/event/event-current-round'
import roundTimers from '../../db/round/round-timers'
import timerCreate from '../../db/timer/timer-create'
import { timerPresets } from '../../timer-presets'
import TimerListItem from '../TimerListItem/TimerListItem'

interface TimerTabProps {
  event: Event
  focused?: boolean
}

export default function TimerTab({ event, focused }: TimerTabProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // Get current round
  const currentRound = useLiveQuery(async () => eventCurrentRound(event), [event])

  // Get timers for current round
  const timers = useLiveQuery(async () => (currentRound ? roundTimers(currentRound) : []), [currentRound?.id])

  const handleCreateTimer = async () => {
    if (!currentRound || !selectedPreset) return

    const preset = timerPresets.find((preset) => preset.label === selectedPreset)
    if (!preset) return

    await timerCreate(currentRound, {
      ...preset,
      matchId: null,
    })
  }

  if (!currentRound) {
    return (
      <Paper withBorder p="lg" shadow="sm">
        <Text>Timers cannot be started until pairings have been assigned</Text>
      </Paper>
    )
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <Select
            placeholder="Select a preset"
            data={timerPresets.map((preset) => preset.label)}
            defaultValue={timerPresets[0].label}
            value={selectedPreset}
            onChange={setSelectedPreset}
          />
          <Button onClick={handleCreateTimer} disabled={!selectedPreset}>
            Start Timer
          </Button>
        </Group>
        <Button
          variant="outline"
          onClick={() => {
            if (typeof window.electron !== 'undefined') {
              window.electron.showTimers(event.id)
            } else {
              window.open(
                `/#/timers/${event.id}/popout`,
                'Timer Popout',
                'popup,titlebar=no,toolbar=no,menubar=no,directories=no,location=no,status=no'
              )
            }
          }}
        >
          Popout
        </Button>
      </Group>
      {timers?.length ? (
        <Stack gap="xl">
          {timers?.map((timer) => <TimerListItem key={timer.id} timer={timer} muted={!focused} />)}
        </Stack>
      ) : (
        <Paper withBorder p="lg" shadow="sm">
          <Text c="dimmed" size="sm">
            No timers have been created for round {currentRound.number}
          </Text>
        </Paper>
      )}
    </Stack>
  )
}
