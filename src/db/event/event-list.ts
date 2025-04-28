import { db } from '../../db'

export interface EventListOptions {
  deleted?: 'with' | 'without' | 'only'
}

export default async function eventList({ deleted = 'without' }: EventListOptions = {}) {
  const events = db.events.orderBy('createdAt').reverse()

  switch (deleted) {
    case 'with':
      return await events.toArray()
    case 'without':
      return await events.filter((event) => !event.deletedAt).toArray()
    case 'only':
      return await events.filter((event) => !!event.deletedAt).toArray()
  }
}
