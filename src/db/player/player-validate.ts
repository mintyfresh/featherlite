import { db, Player } from '../../db'
import { RecordValidationError } from '../errors'

export default async function playerValidate(player: Player) {
  const errors: [string | null, string][] = []

  if (!player.eventId) {
    errors.push(['eventId', 'is required'])
  }

  if (!player.name.trim()) {
    errors.push(['name', "can't be blank"])
  }

  if (player.name.length > 30) {
    errors.push(['name', 'must be 30 characters or fewer'])
  }

  if (!(await isPlayerNameUnique(player))) {
    errors.push(['name', 'must be unique'])
  }

  if (errors.length > 0) {
    throw new RecordValidationError('Player', player.id, errors)
  }

  return player
}

async function isPlayerNameUnique(player: Player) {
  const existingPlayer = await db.players.where({ eventId: player.eventId, name: player.name }).first()

  return !existingPlayer || existingPlayer.id === player.id
}
