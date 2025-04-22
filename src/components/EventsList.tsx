import {
  ActionIcon,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { format } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, Event } from '../db'
import EventModal from './EventModal'

export function EventsList() {
  const navigate = useNavigate()

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
      <Group justify="space-between" mb="xl">
        <Title>Events</Title>
        <Button onClick={() => setModalOpened(true)}>New Event</Button>
      </Group>

      <Stack gap="md">
        {events.map((event) => (
          <Card 
            key={event.id} 
            shadow="sm" 
            padding="lg"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/events/${event.id}`)}
          >
            <Group justify="space-between">
              <div>
                <Text fw={500} size="lg">{event.name}</Text>
                <Text size="sm" c="dimmed">
                  {event.playersCount || 0} players • Created {format(event.createdAt, 'PPP')}
                </Text>
              </div>
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
      />
    </Container>
  )
} 