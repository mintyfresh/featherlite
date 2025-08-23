import { ActionIcon, Group, Select, Text } from '@mantine/core'
import { Timer } from '../../db'
import { useLiveQuery } from 'dexie-react-hooks'
import roundMatches from '../../db/round/round-matches'
import { useMemo, useState } from 'react'
import { TimerCloneInput } from '../../db/timer/timer-clone'

const DURATION_OPTIONS = [
  { label: '+1', value: 1 * 60 * 1000 },
  { label: '+2', value: 2 * 60 * 1000 },
  { label: '+3', value: 3 * 60 * 1000 },
  { label: '+5', value: 5 * 60 * 1000 },
  { label: '+10', value: 10 * 60 * 1000 },
]

export interface TimerCloneMenuProps {
  timer: Timer
  onCloneTimer(input: TimerCloneInput): void
}

export default function TimerCloneMenu({ timer, onCloneTimer }: TimerCloneMenuProps) {
  const [matchId, setMatchId] = useState<string | null>(null)

  const matches = useLiveQuery(() => roundMatches(timer.roundId), [timer.roundId])
  const options = useMemo(
    () =>
      matches?.map((match) => ({
        label: `Table ${match.table}`,
        value: match.id,
      })) ?? [],
    [matches]
  )

  const handleCloneTimer = async (offset: number) => {
    await onCloneTimer({ matchId, offset })
    setMatchId(null)
  }

  return (
    <>
      <Select data={options} placeholder="Select a table" value={matchId} onChange={setMatchId} />
      <Group gap="xs" justify="center">
        {DURATION_OPTIONS.map((option) => (
          <ActionIcon key={option.label} variant="outline" color="gray" onClick={() => handleCloneTimer(option.value)}>
            <Text size="xs">{option.label}</Text>
          </ActionIcon>
        ))}
      </Group>
    </>
  )
}
