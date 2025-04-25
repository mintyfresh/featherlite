import { Accordion, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Event, Player, Round } from '../../../db'
import MatchesGridView from './MatchesGridView'
import MatchesTableView from './MatchesTableView'

interface RoundsListProps {
  view: 'table' | 'grid'
  event: Event
  rounds: Round[]
  players: Player[]
}

export default function RoundsList({ view, event, rounds, players }: RoundsListProps) {
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
            {view === 'table' ? (
              <MatchesTableView round={round} players={players} />
            ) : (
              <MatchesGridView round={round} players={players} />
            )}
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}
