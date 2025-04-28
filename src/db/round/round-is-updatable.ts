import { Round } from '../../db'
import eventGet from '../event/event-get'
import roundGet from './round-get'

export default async function roundIsUpdatable(round: Round | string) {
  if (typeof round === 'string') {
    round = await roundGet(round)
  }

  if (round.isComplete) {
    const event = await eventGet(round.eventId)

    if (event.currentRound && event.currentRound > round.number) {
      return false
    }
  }

  return true
}
