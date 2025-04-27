import { Loader, SimpleGrid } from '@mantine/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Player, Round } from '../../db'
import matchUpdate from '../../db/match/match-update'
import roundMatches from '../../db/round/round-matches'
import MatchCard from './MatchCard'

export interface MatchGridViewProps {
  round: Round
  players: Player[]
}

export default function MatchGridView({ round, players }: MatchGridViewProps) {
  const playerIndex = useMemo(() => new Map<string, Player>(players.map((player) => [player.id, player])), [players])

  const matches = useLiveQuery(() => roundMatches(round.id), [round.id])

  if (!matches) {
    return <Loader data-testid="match-grid-view-loader" />
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          player1={playerIndex.get(match.playerIds[0])!}
          player2={match.playerIds[1] ? playerIndex.get(match.playerIds[1])! : null}
          onSelectWinner={(player) => matchUpdate(match.id, { winnerId: player.id, isDraw: false })}
          onSetDraw={() => matchUpdate(match.id, { winnerId: null, isDraw: true })}
        />
      ))}
    </SimpleGrid>
  )
}
