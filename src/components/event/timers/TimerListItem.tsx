import { ActionIcon, Box, Group, Loader, Text } from '@mantine/core'
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconTrash,
} from '@tabler/icons-react'
import { Timer } from '../../../db'
import useTimer from '../../../hooks/use-timer'
import { integerToColour } from '../../../utils/colour'

interface TimerProps {
  timer: Timer
}

export default function TimerListItem({ timer }: TimerProps) {
  const { phase, hours, minutes, seconds, pause, unpause, skipToNextPhase, reset, destroy } = useTimer(timer)

  if (!phase) {
    return (
      <Box ta="center">
        <Loader />
      </Box>
    )
  }

  return (
    <Box ta="center">
      <Text size="70px" fw="lighter">
        {phase.name}
      </Text>
      <Text size="200px" fw="lighter" lh="12rem" c={integerToColour(phase.colour ?? 0)}>
        {hours > 0 && `${hours.toString().padStart(2, '0')}:`}
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </Text>
      <Group gap="xs">
        <ActionIcon variant="outline" color="gray" onClick={reset}>
          <IconPlayerSkipBack />
        </ActionIcon>
        {timer.pausedAt ? (
          <ActionIcon variant="outline" color="gray" onClick={unpause}>
            <IconPlayerPlay />
          </ActionIcon>
        ) : (
          <ActionIcon variant="outline" color="gray" onClick={pause}>
            <IconPlayerPause />
          </ActionIcon>
        )}
        <ActionIcon
          variant="outline"
          color="gray"
          onClick={() => {
            // Confirm that the user wants to skip if there's more than 5 minutes left on the timer
            if ((hours < 1 && minutes < 5) || confirm('Are you sure you want to skip this phase?')) {
              skipToNextPhase()
            }
          }}
        >
          <IconPlayerSkipForward />
        </ActionIcon>
        <ActionIcon
          variant="outline"
          color="gray"
          onClick={() => {
            confirm('Are you sure you want to delete this timer?') && destroy()
          }}
        >
          <IconTrash />
        </ActionIcon>
      </Group>
    </Box>
  )
}
