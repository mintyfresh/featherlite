import { useState, useEffect } from 'react'
import { 
  Container, 
  Title, 
  Button, 
  Group, 
  Card, 
  Text,
  ActionIcon,
  Stack
} from '@mantine/core'
import { format } from 'date-fns'
import { getAllEvents, addEvent, updateEvent, Event } from '../db'
import { EventModal } from './EventModal'

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([])
  const [modalOpened, setModalOpened] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    const loadedEvents = await getAllEvents()
    setEvents(loadedEvents)
  }

  async function handleCreateEvent(event: Omit<Event, 'id' | 'createdAt' | 'playerCount'>) {
    await addEvent({
      ...event,
      playerCount: 0,
      createdAt: new Date(),
    })
    setModalOpened(false)
    loadEvents()
  }

  async function handleEditEvent(event: Omit<Event, 'id' | 'createdAt' | 'playerCount'>) {
    if (!editingEvent?.id) return
    await updateEvent(editingEvent.id, event)
    setModalOpened(false)
    setEditingEvent(null)
    loadEvents()
  }

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title>Events</Title>
        <Button onClick={() => setModalOpened(true)}>New Event</Button>
      </Group>

      <Stack gap="md">
        {events.map((event) => (
          <Card key={event.id} shadow="sm" padding="lg">
            <Group justify="space-between">
              <div>
                <Text fw={500} size="lg">{event.name}</Text>
                <Text size="sm" c="dimmed">
                  {event.playerCount || 0} players • Created {format(event.createdAt, 'PPP')}
                </Text>
              </div>
              <ActionIcon 
                variant="subtle" 
                onClick={() => {
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
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false)
          setEditingEvent(null)
        }}
        onSubmit={editingEvent ? handleEditEvent : handleCreateEvent}
        initialName={editingEvent?.name}
        title={editingEvent ? 'Edit Event' : 'New Event'}
        submitLabel={editingEvent ? 'Save Changes' : 'Create Event'}
      />
    </Container>
  )
} 