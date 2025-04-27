import { Loader, Table } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Player, Round } from '../../db'
import matchUpdate from '../../db/match/match-update'
import roundMatches from '../../db/round/round-matches'
import MatchListViewItem from './MatchListViewItem'

export interface MatchListViewProps {
  round: Round
  players: Player[]
}

export default function MatchListView({ round, players }: MatchListViewProps) {
  const playerIndex = useMemo(() => new Map<string, Player>(players.map((player) => [player.id, player])), [players])

  const matches = useLiveQuery(() => roundMatches(round.id), [round.id])

  if (!matches) {
    return <Loader />
  }

  return (
    <Table striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Table</Table.Th>
          <Table.Th>Player 1</Table.Th>
          <Table.Th>Player 2</Table.Th>
          <Table.Th>Result</Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {matches.map((match) => (
          <MatchListViewItem
            key={match.id}
            match={match}
            player1={playerIndex.get(match.playerIds[0])!}
            player2={match.playerIds[1] ? playerIndex.get(match.playerIds[1])! : null}
            matchUpdate={matchUpdate}
          />
        ))}
      </Table.Tbody>
    </Table>
  )
}
