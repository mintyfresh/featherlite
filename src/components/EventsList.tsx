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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Event, getAllEvents } from '../db'
import { useDBQuery } from '../hooks/use-db-query'
import EventModal from './EventModal'

export function EventsList() {
  const navigate = useNavigate()

  const { result: events, setResult: setEvents } = useDBQuery(getAllEvents, {
    params: []
  })

  const [modalOpened, setModalOpened] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  if (events === null) {
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
                  {event.playerCount || 0} players • Created {format(event.createdAt, 'PPP')}
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
        onSubmit={(event) => {
          if (editingEvent) {
            setEvents((events) => events?.map((e) => e.id === event.id ? event : e) ?? null)
          } else {
            setEvents((events) => [event, ...(events ?? [])])
          }
        }}
      />
    </Container>
  )
} 