import { ScrollArea, Stack, Title } from '@mantine/core'
import { Event } from '../../db'
import EventChallongeData from './EventChallongeData'
import EventMatchesTable from './EventMatchesTable'
import EventStandingsTable from './EventStandingsTable'

export interface ExportTabProps {
  event: Event
  focused?: boolean
}

export default function ExportTab({ event }: ExportTabProps) {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={3}>Standings</Title>
        <ScrollArea w="100%">
          <EventStandingsTable event={event} />
        </ScrollArea>
      </Stack>
      <Stack gap="xs">
        <Title order={3}>Round {event.currentRound ?? '-'} Matches</Title>
        <ScrollArea w="100%">
          <EventMatchesTable event={event} />
        </ScrollArea>
      </Stack>
      <Stack gap="xs">
        <Title order={3}>Challonge Data</Title>
        <EventChallongeData event={event} />
      </Stack>
    </Stack>
  )
}
