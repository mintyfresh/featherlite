import { Box, Button, Container, Group, Loader, Paper, Select, SimpleGrid, Stack, Text } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { IconColumns, IconVolume, IconVolumeOff } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import TimerListItem from '../../components/TimerListItem/TimerListItem'
import { db } from '../../db'
import eventCurrentRound from '../../db/event/event-current-round'
import roundTimers from '../../db/round/round-timers'

export const Route = createFileRoute('/timers/$eventId/popout')({
  component: EventTimersPopoutPage,
})

function EventTimersPopoutPage() {
  const { eventId } = Route.useParams()

  const event = useLiveQuery(() => db.events.get(eventId), [eventId])
  const currentRound = useLiveQuery(() => event && eventCurrentRound(event), [event])
  const timers = useLiveQuery(() => (currentRound ? roundTimers(currentRound) : []), [currentRound])

  const [cols, setCols] = useState(1)
  const [muted, setMuted] = useLocalStorage({ key: 'timers-popout-muted', defaultValue: true })

  if (!event || !currentRound) {
    return (
      <Container size="md" py="xl">
        <Loader />
      </Container>
    )
  }

  return (
    <Box p="md">
      <Stack>
        <Group justify="space-between">
          <Select
            w="100px"
            data={['1', '2', '3']}
            value={cols.toString()}
            onChange={(value) => setCols(parseInt(value ?? '1'))}
            leftSection={<IconColumns />}
          />
          <Button
            variant="outline"
            color={muted ? 'gray' : 'blue'}
            onClick={() => setMuted(!muted)}
            leftSection={muted ? <IconVolumeOff size={16} /> : <IconVolume size={16} />}
          >
            {muted ? 'Unmute' : 'Mute'}
          </Button>
        </Group>
        {timers?.length ? (
          <SimpleGrid cols={cols}>
            {timers?.map((timer) => <TimerListItem key={timer.id} timer={timer} muted={muted} readOnly />)}
          </SimpleGrid>
        ) : (
          <Paper withBorder p="lg" shadow="sm">
            <Text c="dimmed" size="sm">
              No timers have been created for round {currentRound.number}
            </Text>
          </Paper>
        )}
      </Stack>
    </Box>
  )
}
