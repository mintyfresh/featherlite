import { Alert, Button, Group, Modal, NumberInput, Select, Stack } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Round } from '../../db'
import eventPlayers from '../../db/event/event-players'
import roundMatches from '../../db/round/round-matches'
import roundUpdate from '../../db/round/round-update'
import useFormErrors from '../../hooks/use-form-errors'
import FormBaseErrors from '../FormBaseErrors/FormBaseErrors'

export interface RoundModalProps {
  round: Round
  opened: boolean
  onClose(): void
  onUpdate(): void
}

export default function RoundModal({ round, opened, onClose, onUpdate }: RoundModalProps) {
  const matches = useLiveQuery(() => roundMatches(round), [round])
  const players = useLiveQuery(() => eventPlayers(round.eventId, { sortBy: 'name' }), [round.eventId])

  const [errors, setErrors] = useFormErrors()
  const [loading, setLoading] = useState(false)
  const [pairings, setPairings] = useState<[string, string | null][]>([])

  const isOverwritingResult = useMemo(
    () => matches?.some((match) => match.isDraw || (match.winnerId && match.playerIds[1] !== null)) ?? false,
    [matches]
  )

  const options = useMemo(
    () => [
      ...(players?.map((player) => ({ value: player.id, label: player.name })) ?? []),
      // Add a BYE if there is an odd number of players
      ...(players?.length && players.length % 2 === 1 ? [{ value: 'BYE', label: 'BYE' }] : []),
    ],
    [players]
  )

  useEffect(() => {
    if (matches) {
      setPairings(matches.map((match) => match.playerIds))
    }
  }, [matches])

  const onSelectPlayer = useCallback((index: number, position: 0 | 1, playerId: string | null) => {
    if (playerId === 'BYE') {
      playerId = null
    }

    setPairings((pairings) => {
      // The index and position that the current player occupies
      const currentPlayerIndex = pairings.findIndex((pairing) => pairing.includes(playerId))
      const currentPlayerPosition = pairings[currentPlayerIndex]?.indexOf(playerId) ?? -1

      // The player who previous occupied this position
      const previousPlayerId = pairings[index][position]

      // Deep copy the pairings array to avoid mutating the original
      const newPairings = JSON.parse(JSON.stringify(pairings)) as [string, string | null][]

      // Swap the current player with the previous player
      if (currentPlayerIndex !== -1 && currentPlayerPosition !== -1) {
        newPairings[currentPlayerIndex][currentPlayerPosition] = previousPlayerId
      }

      // Place the current player in the new position
      newPairings[index][position] = playerId!

      // If player1 is now a BYE, swap the positions of the two players
      if (position === 0 && playerId === null) {
        newPairings[index][0] = newPairings[index][1]!
        newPairings[index][1] = null
      }

      return newPairings
    })
  }, [])

  const onSubmit = useCallback(
    async (pairings: [string, string | null][]) => {
      if (isOverwritingResult && !confirm('Are you sure you want to overwrite the existing results?')) {
        return
      }

      setLoading(true)

      try {
        await roundUpdate(round, { matches: pairings.map((pairing) => ({ playerIds: pairing })) })
        onUpdate()
      } catch (error) {
        setErrors(error)
      } finally {
        setLoading(false)
      }
    },
    [isOverwritingResult]
  )

  if (!matches || !players) {
    return null
  }

  return (
    <Modal size="lg" opened={opened} onClose={onClose} title={`Edit Round ${round.number} Pairings`}>
      <Stack
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(pairings)
        }}
      >
        {pairings.map((pairing, index) => (
          <Group key={index} grow>
            <NumberInput label={index === 0 ? 'Table' : undefined} value={index + 1} readOnly />
            <Select
              label={index === 0 ? 'Player 1' : undefined}
              data={options}
              value={pairing[0]}
              onChange={(value) => onSelectPlayer(index, 0, value)}
              disabled={loading}
            />
            <Select
              label={index === 0 ? 'Player 2' : undefined}
              data={options}
              value={pairing[1] ?? 'BYE'}
              onChange={(value) => onSelectPlayer(index, 1, value)}
              disabled={loading}
            />
          </Group>
        ))}
        <FormBaseErrors errors={errors} />
        {isOverwritingResult && (
          <Alert
            color="yellow"
            icon={<IconAlertCircle />}
            title="You are editing a round where results have already been assigned"
          >
            Changing pairings will discard all existing results for all matches in this round.
          </Alert>
        )}
        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
