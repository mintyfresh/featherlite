import { ActionIcon, Group } from '@mantine/core'
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconTrash,
} from '@tabler/icons-react'
import { Timer } from '../../../db'

interface TimerControlsProps {
  timer: Timer
  onReset(): void
  onPause(): void
  onUnpause(): void
  onSkipToNextPhase(): void
  onDestroy(): void
}

export default function TimerControls({
  timer,
  onReset,
  onPause,
  onUnpause,
  onSkipToNextPhase,
  onDestroy,
}: TimerControlsProps) {
  return (
    <Group gap="xs">
      <ActionIcon
        variant="outline"
        color="gray"
        onClick={() => {
          if (confirm('Are you sure you want to reset this timer?')) {
            onReset()
          }
        }}
      >
        <IconPlayerSkipBack />
      </ActionIcon>
      {timer.pausedAt ? (
        <ActionIcon variant="outline" color="gray" onClick={onUnpause}>
          <IconPlayerPlay />
        </ActionIcon>
      ) : (
        <ActionIcon variant="outline" color="gray" onClick={onPause}>
          <IconPlayerPause />
        </ActionIcon>
      )}
      <ActionIcon
        variant="outline"
        color="gray"
        onClick={() => {
          if (confirm('Are you sure you want to skip this phase?')) {
            onSkipToNextPhase()
          }
        }}
      >
        <IconPlayerSkipForward />
      </ActionIcon>
      <ActionIcon
        variant="outline"
        color="gray"
        onClick={() => {
          if (confirm('Are you sure you want to delete this timer?')) {
            onDestroy()
          }
        }}
      >
        <IconTrash />
      </ActionIcon>
    </Group>
  )
}
