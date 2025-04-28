import { Accordion, ActionIcon, Button, Center, Text } from '@mantine/core'
import { IconEdit, IconPrinter } from '@tabler/icons-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Player, Round } from '../../db'
import roundIsUpdatable from '../../db/round/round-is-updatable'
import MatchGridView from '../MatchGridView/MatchGridView'
import MatchListView from '../MatchListView/MatchListView'

export interface RoundListItemProps {
  round: Round
  players: Player[]
  view: 'list' | 'grid'
  onEdit(): void
}

export default function RoundListItem({ round, players, view, onEdit }: RoundListItemProps) {
  const isEditable = useLiveQuery(() => roundIsUpdatable(round), [round])

  return (
    <Accordion.Item value={`round-${round.number}`}>
      <Center>
        <Accordion.Control>
          Round {round.number}
          {round.isComplete && (
            <Text size="xs" c="dimmed">
              Complete
            </Text>
          )}
        </Accordion.Control>
        <Button.Group me="md">
          <ActionIcon
            size="lg"
            variant="subtle"
            color="gray"
            onClick={() => {
              if (typeof window.electron !== 'undefined') {
                window.electron.showMatchSlips(round.id)
              } else {
                window.open(
                  `/#/rounds/${round.id}/slips`,
                  'Slips',
                  'popup,titlebar=no,toolbar=no,menubar=no,directories=no,location=no,status=no,width=600,height=800'
                )
              }
            }}
          >
            <IconPrinter />
          </ActionIcon>
          {isEditable && (
            <ActionIcon size="lg" variant="subtle" color="gray" onClick={onEdit}>
              <IconEdit />
            </ActionIcon>
          )}
        </Button.Group>
      </Center>
      <Accordion.Panel>
        {view === 'list' ? (
          <MatchListView round={round} players={players} />
        ) : (
          <MatchGridView round={round} players={players} />
        )}
      </Accordion.Panel>
    </Accordion.Item>
  )
}
