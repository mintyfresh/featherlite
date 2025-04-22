import { Accordion, Text } from '@mantine/core'
import { Event, Player, Round } from '../../../db'
import MatchesTable from './MatchesTable'

interface RoundsListProps {
  event: Event
  rounds: Round[]
  players: Player[]
}

export default function RoundsList({
  event,
  rounds,
  players,
}: RoundsListProps) {
  const currentRound = event.currentRound

  return (
    <Accordion defaultValue={currentRound !== null ? `round-${currentRound}` : undefined}>
      {rounds.map((round) => (
        <Accordion.Item key={round.id} value={`round-${round.number}`}>
          <Accordion.Control>
            Round {round.number}
            {round.number < (currentRound ?? 0) && (
              <Text size="xs" c="dimmed">
                Complete
              </Text>
            )}
          </Accordion.Control>
          <Accordion.Panel>
            <MatchesTable round={round} players={players} />
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
} 