import { Box, Button, Group, Loader, Text } from '@mantine/core'
import { Timer } from '../../../db'
import useTimer from '../../../hooks/use-timer'
import { integerToColour } from '../../../utils/colour'

interface TimerProps {
  timer: Timer
}

export default function TimerListItem({ timer }: TimerProps) {
  const { phase, hours, minutes, seconds, pause, unpause, skipToNextPhase, destroy } = useTimer(timer)

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
        {hours > 0 && (`${hours.toString().padStart(2, '0')}:`)
        }{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </Text>
      <Group>
        <Button onClick={pause}>Pause</Button>
        <Button onClick={unpause}>Unpause</Button>
        <Button onClick={skipToNextPhase}>Skip</Button>
        <Button onClick={destroy}>Delete</Button>
      </Group>
    </Box>
  )
}
