import { ActionIcon, Group } from '@mantine/core'
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconTrash,
} from '@tabler/icons-react'
import { Timer } from '../../db'

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
        name="Reset"
        role="button"
        data-testid="reset-button"
        variant="outline"
        color="gray"
        onClick={() => {
          if (confirm('Are you sure you want to reset this timer?')) {
            onReset()
          }
        }}
      >
        <IconPlayerSkipBack size={16} />
      </ActionIcon>
      {timer.pausedAt ? (
        <ActionIcon
          name="Unpause"
          role="button"
          data-testid="unpause-button"
          variant="outline"
          color="gray"
          onClick={onUnpause}
        >
          <IconPlayerPlay size={16} />
        </ActionIcon>
      ) : (
        <ActionIcon
          name="Pause"
          role="button"
          data-testid="pause-button"
          variant="outline"
          color="gray"
          onClick={onPause}
        >
          <IconPlayerPause size={16} />
        </ActionIcon>
      )}
      <ActionIcon
        name="Skip to next phase"
        role="button"
        data-testid="skip-to-next-phase-button"
        variant="outline"
        color="gray"
        onClick={() => {
          if (confirm('Are you sure you want to skip this phase?')) {
            onSkipToNextPhase()
          }
        }}
      >
        <IconPlayerSkipForward size={16} />
      </ActionIcon>
      <ActionIcon
        name="Delete"
        role="button"
        data-testid="delete-button"
        variant="outline"
        color="gray"
        onClick={() => {
          if (confirm('Are you sure you want to delete this timer?')) {
            onDestroy()
          }
        }}
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  )
}
