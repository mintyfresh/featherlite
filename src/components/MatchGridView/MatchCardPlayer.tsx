import { Flex, Text, UnstyledButton, UnstyledButtonProps } from '@mantine/core'
import { IconCrown } from '@tabler/icons-react'
import { Match, Player } from '../../db'

export interface MatchCardPlayerProps extends UnstyledButtonProps {
  match: Match
  player: Player
  isWinner: boolean
  onSelectWinner(): void
}

export default function MatchCardPlayer({ match, player, isWinner, onSelectWinner, ...props }: MatchCardPlayerProps) {
  return (
    <UnstyledButton
      fw="initial"
      c={isWinner ? 'green' : 'black'}
      data-testid={`match-card-player-${player.id}`}
      data-test-iswinner={isWinner}
      variant="subtle"
      w="100%"
      ta="center"
      lh={1}
      {...props}
      onClick={() => onSelectWinner()}
    >
      <Flex align="center" justify="center" h="100%" style={{ overflow: 'visible' }}>
        <IconCrown data-testid="tabler-icon-crown" />
        <Text component="span" ms="xs">
          {player.name}
        </Text>
      </Flex>
    </UnstyledButton>
  )
}
