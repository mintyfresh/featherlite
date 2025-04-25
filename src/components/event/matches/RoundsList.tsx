import { Accordion, Text } from '@mantine/core'
import { Event, Player, Round } from '../../../db'
import MatchesTable from './MatchesTable'
import { useEffect, useState } from 'react'

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
  const [expanded, setExpanded] = useState<string[]>(currentRound !== null ? [`round-${currentRound}`] : [])

  useEffect(
    // Expand new rounds by default
    () => setExpanded((expanded) => [...expanded, `round-${currentRound}`]),
    [setExpanded, currentRound]
  )

  return (
    <Accordion variant="separated" multiple value={expanded} onChange={setExpanded}>
      {rounds.map((round) => (
        <Accordion.Item key={round.id} value={`round-${round.number}`}>
          <Accordion.Control>
            Round {round.number}
            {round.isComplete && (
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