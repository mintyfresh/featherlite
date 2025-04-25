import { Accordion, ActionIcon, Center, Text } from '@mantine/core'
import { IconPrinter } from '@tabler/icons-react'
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
    <Accordion chevronPosition="left" variant="separated" multiple value={expanded} onChange={setExpanded}>
      {rounds.map((round) => (
        <Accordion.Item key={round.id} value={`round-${round.number}`}>
          <Center>
            <Accordion.Control>
              Round {round.number}
              {round.isComplete && (
                <Text size="xs" c="dimmed">
                  Complete
                </Text>
              )}
            </Accordion.Control>
            <ActionIcon
              size="lg"
              me="md"
              variant="subtle"
              color="gray"
              onClick={() => {
                window.open(
                  `/rounds/${round.id}/slips`,
                  'Slips',
                  'popup,titlebar=no,toolbar=no,menubar=no,directories=no,location=no,status=no,width=600,height=800'
                )
              }}
            >
              <IconPrinter />
            </ActionIcon>
          </Center>
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
