import { EntityTable, IDType } from 'dexie'
import { RecordNotFoundError } from './errors'

export default function recordGet<T extends { id: string }>(table: EntityTable<T, 'id'>, name: string) {
  return async function (id: IDType<T, 'id'>): Promise<T> {
    const result = await table.get(id)

    if (!result) {
      throw new RecordNotFoundError(name, id)
    }

    return result
  }
}
