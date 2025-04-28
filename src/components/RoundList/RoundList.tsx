import { Accordion } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Event, Player, Round } from '../../db'
import RoundModal from '../RoundModal/RoundModal'
import RoundListItem from './RoundListItem'

interface RoundListProps {
  view: 'list' | 'grid'
  event: Event
  rounds: Round[]
  players: Player[]
}

export default function RoundList({ view, event, rounds, players }: RoundListProps) {
  const currentRound = event.currentRound
  const [editingRound, setEditingRound] = useState<Round | null>(null)
  const [expanded, setExpanded] = useState<string[]>(currentRound !== null ? [`round-${currentRound}`] : [])

  useEffect(
    // Expand new rounds by default
    () => setExpanded((expanded) => [...expanded, `round-${currentRound}`]),
    [setExpanded, currentRound]
  )

  return (
    <>
      <Accordion chevronPosition="left" variant="separated" multiple value={expanded} onChange={setExpanded}>
        {rounds.map((round) => (
          <RoundListItem
            key={round.id}
            round={round}
            players={players}
            view={view}
            onEdit={() => setEditingRound(round)}
          />
        ))}
      </Accordion>
      {editingRound && (
        <RoundModal
          round={editingRound}
          opened={!!editingRound}
          onClose={() => setEditingRound(null)}
          onUpdate={() => setEditingRound(null)}
        />
      )}
    </>
  )
}
