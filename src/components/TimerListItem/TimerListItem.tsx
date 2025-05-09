import { Flex, Text, TextInput } from '@mantine/core'
import { Timer } from '../../db'
import timerUpdate from '../../db/timer/timer-update'
import useTimer from '../../hooks/use-timer'
import { integerToColour } from '../../utils/colour'
import TimerControls from './TimerControls'

export interface TimerListItemProps {
  timer: Timer
  muted?: boolean
  readOnly?: boolean
}

export default function TimerListItem({ timer, muted, readOnly }: TimerListItemProps) {
  const { phase, hours, minutes, seconds, pause, unpause, skipToNextPhase, reset, destroy } = useTimer(timer, { muted })

  return (
    <Flex ta="center" align="center" direction="column" gap="md" data-testid={`timer-list-item-${timer.id}`}>
      <Text size="70px" fw="lighter">
        {phase?.name ?? timer.label}
      </Text>
      <Text size="200px" fw="lighter" lh="12rem" c={integerToColour(phase?.colour ?? 0)}>
        {hours > 0 && `${hours.toString().padStart(2, '0')}:`}
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </Text>
      <TextInput
        defaultValue={timer.label}
        onBlur={(event) => timerUpdate(timer.id, { label: event.currentTarget.value })}
        styles={{
          input: {
            textAlign: 'center',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: readOnly ? 'none' : undefined,
          },
        }}
        radius="none"
        readOnly={readOnly}
      />
      {!readOnly && (
        <TimerControls
          timer={timer}
          onReset={reset}
          onPause={pause}
          onUnpause={unpause}
          onSkipToNextPhase={skipToNextPhase}
          onDestroy={destroy}
        />
      )}
    </Flex>
  )
}
