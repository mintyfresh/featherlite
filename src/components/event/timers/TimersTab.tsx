import { Button, Group, Paper, Select, Stack, Text } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Event } from '../../../db'
import eventCurrentRound from '../../../db/event/event-current-round'
import roundTimers from '../../../db/round/round-timers'
import timerCreate from '../../../db/timer/timer-create'
import { timerPresets } from '../../../timer-presets'
import TimerListItem from './TimerListItem'

interface TimersTabProps {
  event: Event
}

export default function TimersTab({ event }: TimersTabProps) {
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
    <Stack gap="xl">
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

      <Stack gap="xl">{timers?.map((timer) => <TimerListItem key={timer.id} timer={timer} />)}</Stack>
    </Stack>
  )
}
