import { ActionIcon, Box, Button, Card, Container, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import EventModal from '../components/EventModal/EventModal'
import { db, Event } from '../db'

export const Route = createFileRoute('/')({
  component: EventsListPage,
})

export default function EventsListPage() {
  const navigate = Route.useNavigate()

  const events = useLiveQuery(() => db.events.orderBy('createdAt').reverse().toArray())

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
    <Container size="md" py="xl">
      <Group justify="space-between" mb="md">
        <Title>Events</Title>
        <Button onClick={() => setModalOpened(true)}>New Event</Button>
      </Group>

      <Stack gap="md">
        {events.length === 0 && (
          <Paper withBorder p="lg" shadow="sm">
            <Text>Create a new event to get started</Text>
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
              <ActionIcon
                variant="subtle"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingEvent(event)
                  setModalOpened(true)
                }}
              >
                ✎
              </ActionIcon>
            </Group>
          </Card>
        ))}
      </Stack>

      <EventModal
        event={editingEvent}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false)
          setEditingEvent(null)
        }}
        onSubmit={(event) => {
          navigate({ to: `/events/${event.id}` })
        }}
      />
    </Container>
  )
}
