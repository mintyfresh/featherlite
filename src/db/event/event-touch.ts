import { db } from '../../db'

export default async function eventTouch(id: string) {
  await db.events.update(id, { updatedAt: new Date() })

  return true
}
