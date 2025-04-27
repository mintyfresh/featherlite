import { Button, Container, Group, Loader, Tabs, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import ExportTab from '../../components/ExportTab/ExportTab'
import MatchTab from '../../components/MatchTab/MatchTab'
import PlayerTab from '../../components/PlayerTab/PlayerTab'
import TimerInlineDisplay from '../../components/TimerInlineDisplay/TimerInlineDisplay'
import TimerTab from '../../components/TimerTab/TimerTab'
import { db } from '../../db'
import eventCurrentRound from '../../db/event/event-current-round'
import roundTimers from '../../db/round/round-timers'

export const Route = createFileRoute('/events/$eventId')({
  component: EventDetailsPage,
})

export default function EventDetailsPage() {
  const navigate = Route.useNavigate()
  const { eventId, tab } = Route.useParams()

  const event = useLiveQuery(async () => (eventId ? db.events.get(eventId) : null), [eventId])
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
        <Button variant="subtle" onClick={() => navigate({ to: '/' })}>
          ← Back to Events
        </Button>
      </Group>

      <Tabs
        value={tab ?? 'players'}
        onChange={(value) => {
          if (value === 'players') {
            navigate({ to: `/events/${eventId}` })
          } else {
            navigate({ to: `/events/${eventId}/${value}` })
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="players">Players</Tabs.Tab>
          <Tabs.Tab value="matches">Matches</Tabs.Tab>
          <Tabs.Tab value="timers">Timers</Tabs.Tab>
          <Tabs.Tab value="export">Export</Tabs.Tab>

          {/* Pseudo-tabs for inline timers */}
          {timers?.slice(0, 3)?.map((timer, index) => (
            <TimerInlineDisplay
              key={timer.id}
              timer={timer}
              ml={index === 0 ? 'auto' : undefined}
              inert
              muted={tab === 'timers'} // Avoid double sound on timers tab
            />
          ))}
        </Tabs.List>

        <Tabs.Panel value="players" pt="md">
          <PlayerTab event={event} focused={tab === 'players'} />
        </Tabs.Panel>

        <Tabs.Panel value="matches" pt="md">
          <MatchTab event={event} focused={tab === 'matches'} />
        </Tabs.Panel>

        <Tabs.Panel value="timers" pt="md">
          <TimerTab event={event} focused={tab === 'timers'} />
        </Tabs.Panel>

        <Tabs.Panel value="export" pt="md">
          <ExportTab event={event} focused={tab === 'export'} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
