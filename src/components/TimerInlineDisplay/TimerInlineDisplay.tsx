import { Tabs, TabsTabProps } from '@mantine/core'
import { Timer } from '../../db'
import useTimer from '../../hooks/use-timer'
import { integerToColour } from '../../utils/colour'

export interface TimerInlineDisplayProps extends Omit<TabsTabProps, 'value'> {
  timer: Timer
  muted: boolean
}

export default function TimerInlineDisplay({ timer, muted, ...props }: TimerInlineDisplayProps) {
  const { phase, hours, minutes, seconds } = useTimer(timer, { muted })

  return (
    <Tabs.Tab {...props} value={timer.id} c={integerToColour(phase?.colour ?? 0)}>
      {hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </Tabs.Tab>
  )
}
