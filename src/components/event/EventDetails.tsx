import {
  Button,
  Container,
  Group,
  Loader,
  Tabs,
  Title
} from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../../db'
import MatchesTab from './matches/MatchesTab'
import PlayersTab from './players/PlayersTab'

export function EventDetails() {
  const navigate = useNavigate()
  const { id, tab } = useParams<{ id: string, tab: string | undefined }>()

  const event = useLiveQuery(
    async () => id && db.events.get(id),
    [id]
  )

  if (!event) {
    return (
      <Container size="md" py="xl">
        <Loader />
      </Container>
    )
  }

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title>{event.name}</Title>
        <Button variant="subtle" onClick={() => navigate('/')}>← Back to Events</Button>
      </Group>

      <Tabs value={tab ?? 'players'} onChange={(value) => {
        if (value === 'players') {
          navigate(`/events/${id}`)
        } else {
          navigate(`/events/${id}/${value}`)
        }
      }}>
        <Tabs.List>
          <Tabs.Tab value="players">Players</Tabs.Tab>
          <Tabs.Tab value="matches">Matches</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="players" pt="xl">
          <PlayersTab event={event} />
        </Tabs.Panel>

        <Tabs.Panel value="matches" pt="xl">
          <MatchesTab event={event} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
} 