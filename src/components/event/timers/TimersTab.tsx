import { Button, Group, Select, Stack, Text, Title } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Event } from '../../../db'
import eventCurrentRound from '../../../db/event-current-round'
import roundTimers from '../../../db/round-timers'
import timerCreate from '../../../db/timer-create'
import { timerPresets } from '../../../timer-presets'
import TimerListItem from './TimerListItem'

interface TimersTabProps {
  event: Event
}

export default function TimersTab({ event }: TimersTabProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // Get current round
  const currentRound = useLiveQuery(
    async () => eventCurrentRound(event),
    [event.id]
  )

  // Get timers for current round
  const timers = useLiveQuery(
    async () => currentRound ? roundTimers(currentRound) : [],
    [currentRound?.id]
  )

  const handleCreateTimer = async () => {
    if (!currentRound || !selectedPreset) return

    const preset = timerPresets.find((preset) => preset.label === selectedPreset)
    if (!preset) return

    await timerCreate(currentRound, {
      ...preset,
      matchId: null
    })
  }

  if (!currentRound) {
    return (
      <Stack>
        <Title order={3}>No active round</Title>
        <Text>Start a round to create timers</Text>
      </Stack>
    )
  }

  return (
    <Stack>
      <Group>
        <Select
          label="Timer Preset"
          placeholder="Select a preset"
          data={timerPresets.map(preset => preset.label)}
          defaultValue={timerPresets[0].label}
          value={selectedPreset}
          onChange={setSelectedPreset}
          rightSection={
            <Button
              onClick={handleCreateTimer}
              disabled={!selectedPreset}
            >
              Create Timer
            </Button>
          }
        />
      </Group>

      <Stack gap="xl">
        {timers?.map((timer) => (
          <TimerListItem key={timer.id} timer={timer} />
        ))}
      </Stack>
    </Stack>
  )
} 