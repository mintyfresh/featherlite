import { ActionIcon, Anchor, Box, Button, Card, Container, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core'
import { IconPencil, IconRestore, IconTrash } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import EventListToolsMenu from '../components/EventListToolsMenu/EventListToolsMenu'
import EventModal from '../components/EventModal/EventModal'
import { Event } from '../db'
import eventDelete from '../db/event/event-delete'
import eventList from '../db/event/event-list'
import eventRestore from '../db/event/event-restore'

export const Route = createFileRoute('/')({
  component: EventsListPage,
})

export default function EventsListPage() {
  const navigate = Route.useNavigate()

  const [deleted, setDeleted] = useState<'without' | 'only'>('without')
  const events = useLiveQuery(() => eventList({ deleted }), [deleted])

  const [modalOpened, setModalOpened] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  if (!events) {
    return (
      <Container size="md" py="xl">
        <Loader />
      </Container>
    )
  }

  return (
    <Container size="md" mih="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Group justify="space-between" mt="xl" mb="md">
        <Title>Events</Title>
        <Group>
          <EventListToolsMenu events={events} />
          {deleted === 'without' ? (
            <Button variant="outline" color="gray" onClick={() => setDeleted('only')}>
              Show Deleted
            </Button>
          ) : (
            <Button variant="outline" color="gray" onClick={() => setDeleted('without')}>
              Show Active
            </Button>
          )}
          <Button onClick={() => setModalOpened(true)}>New Event</Button>
        </Group>
      </Group>

      <Stack gap="md">
        {events.length === 0 && (
          <Paper withBorder p="lg" shadow="sm">
            <Text c="dimmed" size="sm">
              {deleted === 'without' ? 'Create a new event to get started' : 'No events have been deleted'}
            </Text>
          </Paper>
        )}

        {events.map((event) => (
          <Card
            key={event.id}
            withBorder
            shadow="sm"
            p="lg"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate({ to: `/events/${event.id}` })}
            role="button"
          >
            <Group justify="space-between">
              <Box>
                <Text fw={500} size="lg">
                  {event.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {event.playersCount} players • Created {format(event.createdAt, 'PPP')}
                </Text>
              </Box>
              <Group gap="xs">
                <ActionIcon
                  role="button"
                  name="Edit"
                  variant="subtle"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingEvent(event)
                    setModalOpened(true)
                  }}
                >
                  <IconPencil size={18} />
                </ActionIcon>
                {event.deletedAt ? (
                  <ActionIcon
                    role="button"
                    name="Restore"
                    variant="subtle"
                    onClick={(e) => {
                      e.stopPropagation()
                      eventRestore(event)
                    }}
                  >
                    <IconRestore size={18} />
                  </ActionIcon>
                ) : (
                  <ActionIcon
                    role="button"
                    name="Delete"
                    variant="subtle"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Are you sure you want to delete this event?')) {
                        eventDelete(event)
                      }
                    }}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                )}
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>

      <Box mt="auto" py="xl">
        <Stack gap="0.25rem">
          <Text size="sm" c="dimmed" ta="center">
            Copyright &copy; 2025 <Anchor href="https://github.com/mintyfresh">Minty Fresh</Anchor> &mdash; All ponies are cute.
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Made with ❤️ in snowy 🇨🇦
          </Text>
        </Stack>
      </Box>

      <EventModal
        event={editingEvent}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false)
          setEditingEvent(null)
        }}
        onSubmit={(event) => {
          if (!editingEvent) {
            navigate({ to: `/events/${event.id}` })
          }
          setEditingEvent(null)
          setModalOpened(false)
        }}
      />
    </Container>
  )
}
