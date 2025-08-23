import { ActionIcon, Group, Stack } from '@mantine/core'
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerRecordFilled,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconTrash,
} from '@tabler/icons-react'
import { Timer } from '../../db'
import { useDisclosure } from '@mantine/hooks'
import TimerCloneMenu from './TimerCloneMenu'
import { TimerCloneInput } from '../../db/timer/timer-clone'

interface TimerControlsProps {
  timer: Timer
  onReset(): void
  onPause(): void
  onUnpause(): void
  onSkipToNextPhase(): void
  onClone(input: TimerCloneInput): void
  onDestroy(): void
}

export default function TimerControls({
  timer,
  onReset,
  onPause,
  onUnpause,
  onSkipToNextPhase,
  onClone,
  onDestroy,
}: TimerControlsProps) {
  const [isCloneMenuOpen, { toggle: toggleCloneMenu, close: closeCloneMenu }] = useDisclosure(false)

  return (
    <Stack>
      <Group gap="xs" justify="center">
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
          name="Clone Timer"
          role="button"
          data-testid="clone-timer-button"
          variant="outline"
          color="gray"
          onClick={toggleCloneMenu}
        >
          <IconPlayerRecordFilled size={16} />
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
      {isCloneMenuOpen && (
        <TimerCloneMenu
          timer={timer}
          onCloneTimer={(input) => {
            onClone(input)
            closeCloneMenu()
          }}
        />
      )}
    </Stack>
  )
}
