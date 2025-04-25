import { Button, Container, Group, Loader, Tabs, TabsTabProps, Title } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { db, Timer } from '../../db'
import eventCurrentRound from '../../db/event/event-current-round'
import roundTimers from '../../db/round/round-timers'
import useTimer from '../../hooks/use-timer'
import { integerToColour } from '../../utils/colour'
import MatchesTab from './matches/MatchesTab'
import PlayersTab from './players/PlayersTab'
import TimersTab from './timers/TimersTab'

export function EventDetails() {
  const navigate = useNavigate()
  const { id, tab } = useParams<{ id: string; tab: string | undefined }>()

  const event = useLiveQuery(async () => (id ? db.events.get(id) : null), [id])
  const currentRound = useLiveQuery(async () => event && eventCurrentRound(event), [event])
  const timers = useLiveQuery(async () => currentRound && roundTimers(currentRound), [currentRound])

  if (!event) {
    return (
      <Container size="md" py="xl">
        <Loader />
      </Container>
    )
  }

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="md">
        <Title>{event.name}</Title>
        <Button variant="subtle" onClick={() => navigate('/')}>
          ← Back to Events
        </Button>
      </Group>

      <Tabs
        value={tab ?? 'players'}
        onChange={(value) => {
          if (value === 'players') {
            navigate(`/events/${id}`)
          } else {
            navigate(`/events/${id}/${value}`)
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="players">Players</Tabs.Tab>
          <Tabs.Tab value="matches">Matches</Tabs.Tab>
          <Tabs.Tab value="timers">Timers</Tabs.Tab>
          {timers
            ?.slice(0, 3)
            ?.map((timer, index) => (
              <TimerTab key={timer.id} timer={timer} ml={index === 0 ? 'auto' : undefined} inert />
            ))}
        </Tabs.List>

        <Tabs.Panel value="players" pt="md">
          <PlayersTab event={event} />
        </Tabs.Panel>

        <Tabs.Panel value="matches" pt="md">
          <MatchesTab event={event} />
        </Tabs.Panel>

        <Tabs.Panel value="timers" pt="md">
          <TimersTab event={event} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}

function TimerTab({ timer, ...props }: { timer: Timer } & Omit<TabsTabProps, 'value'>) {
  const { phase, hours, minutes, seconds } = useTimer(timer)

  return (
    <Tabs.Tab {...props} value={timer.id} c={integerToColour(phase?.colour ?? 0)}>
      {hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </Tabs.Tab>
  )
}
